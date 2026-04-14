# 前后端联调开发计划

> 最后更新：2026-04-14  
> 流式方案：SSE（Server-Sent Events）  
> 状态标记：⬜ 待开始 | 🔧 进行中 | ✅ 已完成

---

## 阶段一：基础设施搭建 ⬜

> 目标：搭建前端联调所需的所有基础能力

### 1.1 安装依赖

- [ ] 安装 `axios`（HTTP 请求）
- [ ] 安装 `pinia`（状态管理）

```bash
npm install axios pinia
```

### 1.2 环境变量配置

- [ ] 创建 `.env.development`

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=旅行智能体
```

- [ ] 创建 `.env.production`

```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=旅行智能体
```

### 1.3 Vite 代理配置

- [ ] 修改 `vite.config.js`，添加开发环境代理

```javascript
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

### 1.4 创建 API 封装层

- [ ] 创建 `src/utils/request.js` — axios 实例（拦截器、token注入、错误处理）
- [ ] 创建 `src/utils/sse.js` — SSE 流式请求工具（基于 fetch + ReadableStream）
- [ ] 创建 `src/api/chat.js` — 对话相关接口
- [ ] 创建 `src/api/home.js` — 首页相关接口
- [ ] 创建 `src/api/auth.js` — 用户认证接口（如需要）

### 1.5 创建状态管理

- [ ] 创建 `src/stores/index.js` — Pinia 初始化
- [ ] 创建 `src/stores/chat.js` — 对话状态管理（对话列表、当前对话、消息列表）
- [ ] 创建 `src/stores/user.js` — 用户状态管理（如需要）

---

## 阶段二：首页接口联调 ⬜

> 目标：首页数据从后端动态获取

- [ ] `HomeSkeleton.vue` — 分类标签从 `GET /api/categories` 获取
- [ ] `HomeSkeleton.vue` — 目的地卡片从 `GET /api/destinations` 获取
- [ ] 添加加载状态（骨架屏 / loading 动画）
- [ ] 添加数据为空时的兜底展示
- [ ] 添加接口错误提示

---

## 阶段三：聊天页接口联调（核心）⬜

> 目标：完成AI对话的完整流程，支持SSE流式消息

### 3.1 对话历史管理

- [ ] `ChatHistory.vue` — 从 `GET /api/chats` 获取对话列表
- [ ] `ChatHistory.vue` — 新建对话调用 `POST /api/chats`
- [ ] `ChatHistory.vue` — 删除对话调用 `DELETE /api/chats/:id`
- [ ] `ChatHistory.vue` — 重命名调用 `PUT /api/chats/:id`
- [ ] `ChatHistory.vue` — 置顶/取消置顶调用 `PUT /api/chats/:id`
- [ ] 切换对话时加载对应消息列表

### 3.2 消息发送与SSE流式接收

- [ ] `ChatTable.vue` — 加载消息列表 `GET /api/chats/:id/messages`
- [ ] `ChatTable.vue` — 发送消息 `POST /api/chats/:id/messages`
- [ ] 实现 SSE 流式接收，逐字渲染AI回复
- [ ] 实现打字机效果（逐字追加到气泡）
- [ ] 实现停止回复（AbortController 中断流）
- [ ] 首页搜索跳转后自动创建对话并发送首条消息

### 3.3 SSE 流式实现细节

```
发送消息流程：
1. 用户输入 → 追加 user 消息到列表
2. 创建一条空的 ai 消息（loading 状态）
3. 通过 fetch POST 发送，接收 SSE 流
4. 解析 event: start → 记录 messageId
5. 解析 event: delta → 逐字追加 content 到 ai 消息
6. 解析 event: done → 完成，更新最终内容
7. 解析 event: error → 显示错误提示

停止回复流程：
1. 用户点击"停止回复"
2. 调用 AbortController.abort() 中断 fetch
3. 显示"已停止回复"
4. 恢复输入框状态
```

---

## 阶段四：用户认证（如需要）⬜

> 目标：实现登录注册和权限控制

- [ ] 创建登录/注册页面组件
- [ ] 实现 token 存储（localStorage）
- [ ] axios 拦截器自动注入 Authorization 头
- [ ] 401 响应自动跳转登录页
- [ ] 路由守卫：未登录拦截跳转
- [ ] AppHeader 展示用户信息 / 登出按钮

---

## 阶段五：优化与完善 ⬜

> 目标：提升用户体验和代码质量

- [ ] 全局错误处理（toast 提示）
- [ ] 首页加载骨架屏
- [ ] 聊天消息支持 Markdown 渲染（如需要）
- [ ] 消息列表虚拟滚动（如消息量大）
- [ ] 响应式适配检查
- [ ] 网络断开/重连处理
- [ ] 代码优化与组件拆分

---

## 联调后目标目录结构

```
src/
├── main.js                      # 入口：挂载 Router + Pinia
├── App.vue                      # 根组件
├── router.js                    # 路由（新增登录页路由等）
├── style.css                    # 全局样式
│
├── api/                         # 🆕 接口封装层
│   ├── chat.js                  #    对话相关接口
│   ├── home.js                  #    首页相关接口
│   └── auth.js                  #    用户认证接口
│
├── utils/                       # 🆕 工具函数
│   ├── request.js               #    axios 实例与拦截器
│   └── sse.js                   #    SSE 流式请求工具
│
├── stores/                      # 🆕 Pinia 状态管理
│   ├── index.js                 #    Pinia 初始化
│   ├── chat.js                  #    对话 & 消息状态
│   └── user.js                  #    用户状态
│
├── assets/                      # 静态资源
├── components/                  # 公共组件
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   ├── ChatHistory.vue          # 改造：对接真实接口
│   ├── ChatTable.vue            # 改造：SSE 流式接收
│   └── HomeSkeleton.vue         # 改造：动态数据
│
├── layout/                      # 布局组件
│   ├── BasicLayout.vue
│   └── ChatLayout.vue
│
└── views/                       # 页面视图
    ├── FaceView.vue
    ├── ChatView.vue
    └── LoginView.vue            # 🆕 登录页（如需要）
```

---

## 开发优先级

```
P0（必须）：阶段一 + 阶段三（基础设施 + AI对话 SSE 联调）
P1（重要）：阶段二（首页数据）
P2（按需）：阶段四（用户认证）
P3（优化）：阶段五
```

联调启动条件：后端提供 API 地址 + 接口文档 + SSE 格式确认
