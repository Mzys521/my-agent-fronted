# SSE 流式方案技术指南

> 本项目 AI 对话回复采用 **SSE（Server-Sent Events）** 流式传输方案

---

## 一、为什么选择 SSE

| 方案 | 优点 | 缺点 |
|------|------|------|
| **普通 HTTP** | 最简单 | 需等待完整回复，用户体验差 |
| **SSE** ✅ | 单向流式，浏览器原生支持，HTTP协议 | 仅支持服务端→客户端单向推送 |
| **WebSocket** | 双向通信 | 实现复杂，对话场景无需双向 |

SSE 最适合 AI 对话场景：用户发送请求后，服务端逐字推送回复内容。

---

## 二、SSE 协议约定

### 2.1 请求方式

由于 `EventSource` API 仅支持 GET 请求，而发送消息需要 POST + 请求体，因此前端使用 **fetch API + ReadableStream** 手动解析 SSE 流。

```
POST /api/chats/:chatId/messages
Content-Type: application/json
Accept: text/event-stream
Authorization: Bearer <token>

{
  "content": "用户消息内容"
}
```

### 2.2 响应格式

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### 2.3 事件类型定义

| 事件 | 触发时机 | data 格式 | 说明 |
|------|---------|----------|------|
| `start` | AI 开始生成 | `{"messageId": "xxx"}` | 前端创建空消息占位 |
| `delta` | 每生成一段文本 | `{"content": "增量文本"}` | 前端追加到当前回复 |
| `done` | 生成完毕 | `{"messageId": "xxx", "content": "完整文本"}` | 前端结束 loading |
| `error` | 生成出错 | `{"code": 500, "message": "错误信息"}` | 前端显示错误提示 |

### 2.4 SSE 流示例

```text
event: start
data: {"messageId": "msg_20260414_001"}

event: delta
data: {"content": "好的"}

event: delta
data: {"content": "，我来帮你"}

event: delta
data: {"content": "规划一趟"}

event: delta
data: {"content": "5天的云南之旅"}

event: delta
data: {"content": "！\n\n"}

event: delta
data: {"content": "**第一天：昆明**\n"}

event: delta
data: {"content": "- 上午：游览翠湖公园\n"}

event: done
data: {"messageId": "msg_20260414_001", "content": "好的，我来帮你规划一趟5天的云南之旅！\n\n**第一天：昆明**\n- 上午：游览翠湖公园\n..."}

```

---

## 三、前端实现方案

### 3.1 SSE 工具封装 (`src/utils/sse.js`)

```javascript
/**
 * 发送 POST 请求并解析 SSE 流
 *
 * @param {string} url        - 请求地址
 * @param {object} body       - 请求体
 * @param {object} callbacks  - 回调函数
 * @param {function} callbacks.onStart  - 收到 start 事件
 * @param {function} callbacks.onDelta  - 收到 delta 事件（增量文本）
 * @param {function} callbacks.onDone   - 收到 done 事件（完成）
 * @param {function} callbacks.onError  - 收到 error 事件或请求异常
 *
 * @returns {function} abort   - 调用此函数中断流
 */
export function fetchSSE(url, body, callbacks) {
  const controller = new AbortController()

  const run = async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          // 'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 按双换行分割 SSE 事件
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // 最后不完整的部分留在 buffer

        for (const part of parts) {
          const event = parseSSEEvent(part)
          if (!event) continue

          switch (event.type) {
            case 'start':
              callbacks.onStart?.(event.data)
              break
            case 'delta':
              callbacks.onDelta?.(event.data)
              break
            case 'done':
              callbacks.onDone?.(event.data)
              break
            case 'error':
              callbacks.onError?.(event.data)
              break
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        callbacks.onError?.({ message: err.message })
      }
    }
  }

  run()

  // 返回中断函数
  return () => controller.abort()
}

/**
 * 解析单个 SSE 事件块
 */
function parseSSEEvent(raw) {
  const lines = raw.split('\n')
  let type = 'message'
  let data = ''

  for (const line of lines) {
    if (line.startsWith('event: ')) {
      type = line.slice(7).trim()
    } else if (line.startsWith('data: ')) {
      data = line.slice(6)
    }
  }

  try {
    return { type, data: JSON.parse(data) }
  } catch {
    return { type, data }
  }
}
```

### 3.2 在 ChatTable 中使用

```javascript
import { fetchSSE } from '@/utils/sse'

const sendMessage = (content) => {
  // 1. 追加用户消息
  messages.value.push({ role: 'user', content })

  // 2. 创建 AI 消息占位
  const aiMsg = reactive({ role: 'ai', content: '', loading: true })
  messages.value.push(aiMsg)

  // 3. 发起 SSE 请求
  const abort = fetchSSE(
    `/api/chats/${chatId}/messages`,
    { content },
    {
      onStart({ messageId }) {
        aiMsg.id = messageId
      },
      onDelta({ content }) {
        aiMsg.content += content  // 逐字追加
        scrollToBottom()
      },
      onDone({ content }) {
        aiMsg.content = content   // 确保最终内容一致
        aiMsg.loading = false
        isWaiting.value = false
      },
      onError({ message }) {
        aiMsg.content = `回复出错：${message}`
        aiMsg.loading = false
        isWaiting.value = false
      }
    }
  )

  // 4. 保存 abort 函数用于"停止回复"
  currentAbort = abort
  isWaiting.value = true
}

const stopReply = () => {
  currentAbort?.()
  isWaiting.value = false
}
```

---

## 四、后端实现注意事项

### 4.1 响应头设置

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no          # 如果有 Nginx 代理，禁用缓冲
```

### 4.2 数据格式要求

- 每个事件以 `\n\n`（双换行）结尾
- `event:` 和 `data:` 字段之间用 `\n` 分隔
- `data:` 字段值必须是合法 JSON 字符串

### 4.3 连接管理

- 客户端断开时（AbortController），后端应停止 AI 生成，释放资源
- 建议设置超时时间，防止长时间无数据的僵死连接
- 可选：发送心跳 `event: ping\ndata: {}\n\n` 维持连接活跃

### 4.4 Nginx 代理配置（如有）

```nginx
location /api/ {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;             # 关键：禁用代理缓冲
    proxy_cache off;
    chunked_transfer_encoding on;
}
```

---

## 五、常见问题

### Q1: 为什么不用原生 EventSource？
`EventSource` 只支持 GET 请求，无法携带 POST 请求体发送用户消息，因此使用 `fetch` + `ReadableStream` 手动实现。

### Q2: 如何处理网络中断？
前端 `fetch` 会抛出异常，在 `onError` 中提示用户"网络异常，请重试"。

### Q3: 消息内容支持 Markdown 吗？
取决于后端返回的内容格式。如支持 Markdown，前端需安装 `markdown-it` 或 `marked` 进行渲染。

### Q4: delta 的粒度是什么？
建议每次 delta 推送 1~5 个字/词，过大会失去流式效果，过小会增加网络开销。
