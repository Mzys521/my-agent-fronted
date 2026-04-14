# 后端接口需求清单

> 最后更新：2026-04-14  
> AI回复方案：**SSE（Server-Sent Events）流式响应**

---

## 一、基础约定（需后端确认）

| 需求项 | 说明 | 后端反馈 |
|--------|------|---------|
| 开发环境 API 地址 | 例如 `http://localhost:8080` | ⬜ 待填 |
| 接口文档地址 | Swagger / Apifox 链接 | ⬜ 待填 |
| 统一响应格式 | 建议 `{ code: 200, message: "ok", data: {} }` | ⬜ 待确认 |
| 错误码规范 | 如 401 未认证、403 无权限、500 服务错误 | ⬜ 待确认 |
| 认证方式 | JWT / Session / API Key？是否需要登录？ | ⬜ 待确认 |
| Token 传递方式 | `Authorization: Bearer <token>` ? | ⬜ 待确认 |
| 跨域策略 | 后端开启 CORS / 前端 Vite 代理 | ⬜ 待确认 |

---

## 二、接口列表

### 2.1 🔐 用户模块（如需要登录）

#### `POST /api/auth/login` — 用户登录

```
请求：
{
  "username": "string",
  "password": "string"
}

响应：
{
  "code": 200,
  "message": "ok",
  "data": {
    "token": "jwt-token-string",
    "user": {
      "id": 1,
      "username": "张三",
      "avatar": "url"
    }
  }
}
```

#### `POST /api/auth/register` — 用户注册

```
请求：
{
  "username": "string",
  "password": "string"
}

响应：
{
  "code": 200,
  "message": "注册成功",
  "data": { "id": 1, "username": "张三" }
}
```

#### `GET /api/user/info` — 获取当前用户信息

```
请求头：Authorization: Bearer <token>

响应：
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "张三",
    "avatar": "url"
  }
}
```

---

### 2.2 🏠 首页模块

#### `GET /api/categories` — 获取旅行分类标签

```
响应：
{
  "code": 200,
  "data": [
    { "id": 1, "name": "自然风光", "icon": "🏔️" },
    { "id": 2, "name": "人文历史", "icon": "🏛️" },
    ...
  ]
}
```

#### `GET /api/destinations` — 获取热门目的地

```
查询参数（可选）：?category=海岛度假&page=1&size=10

响应：
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "巴厘岛·热带海岛",
      "subtitle": "阳光海岸、温柔沙滩与浪漫双人夜。",
      "type": "海岛度假",
      "price": "4300 3天2晚起",
      "image": "https://xxx.com/bali.jpg"
    },
    ...
  ]
}
```

---

### 2.3 💬 AI 对话模块（核心）

#### `POST /api/chats` — 创建新对话

```
请求：
{
  "title": "新对话"        // 可选，默认生成
}

响应：
{
  "code": 200,
  "data": {
    "id": "chat_abc123",
    "title": "新对话",
    "pinned": false,
    "createdAt": "2026-04-14T08:00:00Z"
  }
}
```

#### `GET /api/chats` — 获取对话历史列表

```
响应：
{
  "code": 200,
  "data": [
    {
      "id": "chat_abc123",
      "title": "云南旅行规划",
      "pinned": true,
      "createdAt": "2026-04-14T08:00:00Z",
      "updatedAt": "2026-04-14T09:00:00Z"
    },
    ...
  ]
}
```

#### `PUT /api/chats/:id` — 更新对话（重命名 / 置顶）

```
请求：
{
  "title": "新标题",       // 可选
  "pinned": true           // 可选
}

响应：
{
  "code": 200,
  "message": "更新成功"
}
```

#### `DELETE /api/chats/:id` — 删除对话

```
响应：
{
  "code": 200,
  "message": "删除成功"
}
```

#### `GET /api/chats/:id/messages` — 获取对话消息列表

```
响应：
{
  "code": 200,
  "data": [
    {
      "id": "msg_001",
      "role": "ai",
      "content": "你好，我是你的旅行智能助手～",
      "createdAt": "2026-04-14T08:00:00Z"
    },
    {
      "id": "msg_002",
      "role": "user",
      "content": "我想去云南",
      "createdAt": "2026-04-14T08:01:00Z"
    },
    ...
  ]
}
```

#### ⭐ `POST /api/chats/:id/messages` — 发送消息 + SSE 流式回复

> **这是最核心的接口，使用 SSE (Server-Sent Events) 流式响应**

```
请求头：
  Content-Type: application/json
  Accept: text/event-stream
  Authorization: Bearer <token>

请求体：
{
  "content": "帮我规划一个5天的云南旅行"
}
```

**SSE 响应流格式：**

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

event: start
data: {"messageId": "msg_003"}

event: delta
data: {"content": "好的"}

event: delta
data: {"content": "，我来"}

event: delta
data: {"content": "为你规划"}

event: delta
data: {"content": "云南5天行程"}

event: done
data: {"messageId": "msg_003", "content": "好的，我来为你规划云南5天行程...（完整内容）"}

```

**SSE 事件类型说明：**

| 事件名 | 说明 | data 字段 |
|--------|------|----------|
| `start` | AI 开始回复 | `{ messageId }` |
| `delta` | 增量文本片段 | `{ content }` — 追加到当前回复 |
| `done` | 回复完成 | `{ messageId, content }` — 完整内容 |
| `error` | 回复异常 | `{ code, message }` |

**前端 SSE 处理伪代码：**

```javascript
const eventSource = new EventSource('/api/chats/:id/messages')
// 或使用 fetch + ReadableStream（因为需要 POST 请求）

// 推荐方案：使用 fetch 发 POST，手动解析 SSE 流
const response = await fetch(`/api/chats/${chatId}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  },
  body: JSON.stringify({ content: userMessage })
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const text = decoder.decode(value)
  // 解析 SSE 格式，逐字追加到界面
}
```

**中断/停止回复：**
- 前端通过 `reader.cancel()` 或 `AbortController.abort()` 中断连接
- 后端需关注：请后端确认是否需要额外调 `POST /api/chats/:id/messages/stop` 来通知停止

---

## 三、数据模型参考

### Chat（对话）
```
{
  id:        string    // 对话唯一ID
  title:     string    // 对话标题
  pinned:    boolean   // 是否置顶
  createdAt: string    // 创建时间 (ISO 8601)
  updatedAt: string    // 最后更新时间
}
```

### Message（消息）
```
{
  id:        string    // 消息唯一ID
  chatId:    string    // 所属对话ID
  role:      string    // "user" | "ai"
  content:   string    // 消息内容（纯文本 or Markdown）
  createdAt: string    // 发送时间
}
```

### Destination（目的地）
```
{
  id:       number
  title:    string    // 标题
  subtitle: string    // 副标题/描述
  type:     string    // 分类
  price:    string    // 价格信息
  image:    string    // 图片URL
}
```

### Category（分类标签）
```
{
  id:   number
  name: string    // 标签名
  icon: string    // 图标（emoji 或 icon class）
}
```

### User（用户）
```
{
  id:       number
  username: string
  avatar:   string    // 头像URL
}
```

---

## 四、待后端确认的问题

- [ ] 开发环境 API 地址是什么？
- [ ] 是否需要用户登录？认证方式？
- [ ] 统一响应格式是否如上所示？
- [ ] SSE 流式响应的事件格式是否如上约定？
- [ ] AI 回复内容是纯文本还是支持 Markdown？
- [ ] 消息内容最大长度限制？
- [ ] 是否需要额外的停止回复接口？
- [ ] 目的地图片是后端存储还是外部链接？
- [ ] 对话 ID 类型是 string 还是 number？
