# 旅行智能体前端 — 项目架构分析

> 最后更新：2026-04-14

## 一、项目基本信息

| 项目属性 | 详情 |
|---------|-----|
| **项目名称** | agent-front |
| **项目路径** | `d:\shixun\agent-front` |
| **技术栈** | Vue 3.5 + Vite 8 + Vue Router 4 |
| **构建工具** | Vite (通过 `@vitejs/plugin-vue` 支持 Vue SFC) |
| **包管理** | npm |
| **当前状态** | ✅ 前端UI已完成，✅ 后端API已就绪，⏳ 当前进入前端与后端API的全面联调开发阶段 |

## 二、项目目录结构

```
agent-front/
├── index.html                  # 入口HTML
├── package.json                # 依赖配置
├── vite.config.js              # Vite构建配置（待配置代理）
├── docs/                       # 项目文档（当前分析、API文档等）
├── public/
│   ├── bg-video.mp4            # 公共视频资源
│   ├── favicon.svg             # 网站图标
│   └── icons.svg               # 图标集
├── src/
│   ├── main.js                 # 应用入口（创建Vue App + 挂载Router）
│   ├── App.vue                 # 根组件（仅包含 <router-view>）
│   ├── router.js               # 路由配置
│   ├── style.css               # 全局样式
│   ├── assets/
│   │   ├── bg-video-trim.mp4   # 首页背景视频 (~19MB)
│   │   └── face_background.jpg # 背景图
│   ├── components/
│   │   ├── AppHeader.vue       # 顶部导航栏
│   │   ├── AppFooter.vue       # 底部页脚
│   │   ├── ChatHistory.vue     # 聊天历史记录列表（左侧栏）
│   │   ├── ChatTable.vue       # 聊天消息区域（右侧主区域）
│   │   ├── HomeSkeleton.vue    # 首页主体内容
│   │   └── HelloWorld.vue      # 默认空组件（未使用）
│   ├── layout/
│   │   ├── BasicLayout.vue     # 基础布局（Header + Slot + Footer）
│   │   └── ChatLayout.vue      # 聊天布局（左右分栏 16.7% / 83.3%）
│   └── views/
│       ├── FaceView.vue        # 首页视图（/ 路由）
│       └── ChatView.vue        # 聊天视图（/chat 路由）
└── dist/                       # 构建产物
```

## 三、路由配置

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/` | Home | FaceView | 首页：视频Banner + 搜索框 + 热门分类 + 目的地卡片 + 优势 |
| `/chat` | Chat | ChatView | 聊天页：接收 `?userMessage=xxx` 查询参数作为首条消息 |

## 四、各组件功能与后端接口映射方案

后端服务地址位于 `http://127.0.0.1:8000`，接口均返回规范的 `{code, message, data}` 结构格式（SSE流接口除外）。

### 4.1 用户鉴权状态 (AppHeader等全局组件)

| 功能 | 后端接口 | 说明 |
|------|---------|------|
| 注册 | `POST /api/auth/register` | 提供 `username` 和 `password` |
| 登录 | `POST /api/auth/login` | 返回 JWT token。后续接口（除注册/登录等）需要在 Header 的 `Authorization` 中带上 `Bearer <Token>` |
| 获取用户信息 | `GET /api/auth/user/info` | 拉取当前登录用户状态及头像等 |

### 4.2 HomeSkeleton（首页主体）& 规划分析

| 数据项 | 当前状态 | 后端接口 / 改造计划 |
|--------|---------|---------|
| 分类标签 / 推荐 | 硬编码 | *后续可按需扩展动态接口* |
| 行程表单 / 搜索 | 跳转到 `/chat?userMessage=xxx` | 可进一步对接 `POST /plan` 接口，提交结构化排期请求；或者直接传递给 Chatbot 由 AI 分析 |

### 4.3 ChatHistory（聊天历史会话管理）

所有接口均需携带 JWT Token。

| 功能 | 当前实现 | 需要对接的后端 API |
|------|---------|------------------|
| 历史列表 | 四条硬编码 mock | `GET /api/chats` 返回 `[{id, title, pinned, created_at, ...}]` |
| 新建对话 | 本地生成 `Date.now()` | `POST /api/chats` (`{title, pinned}`) |
| 获取对话内容 | 本地存储切换 | 点击某对话后请求 `GET /api/chats/{chat_id}/messages` |
| 重命名 / 置顶 | 仅修改本地数据 | `PUT /api/chats/{chat_id}` 提交 `{title, pinned}` 增量更新 |
| 删除会话 | 仅删本地数据 | `DELETE /api/chats/{chat_id}` |

### 4.4 ChatTable（聊天消息通信）

核心对话组件。

| 功能 | 当前实现 | 需要对接的后端 API |
|------|---------|------------------|
| 历史消息展示 | 1条硬编码欢迎语 | `GET /api/chats/{chat_id}/messages` 获取当前会话下完整的消息记录 (Role/Content/Time) |
| 发送并接收回复 | `setTimeout` 模拟回复 | `POST /api/chats/{chat_id}/messages` 提交 `{content}`。**必须采用 Server-Sent Events (SSE)** 流式接收 |
| 停止回复 | `clearTimeout` | 在前端终止 `AbortController` 请求 |
| 首条路由参数 | 参数接收发消息 | 首次携带路由参数跳转时自动新建对话并触发上方的流式请求接口 |

## 五、前端联调开发接机与缺失项清单

为了顺利接入后端系统，前端目前需要补齐以下基础设施建设：

1. **环境与网络配置**
   - **Vite 代理**：需在 `vite.config.js` 配置 `server.proxy` 将 `/api` 代理到 `http://127.0.0.1:8000` 解决开发时的跨域问题。
   - **环境变量配置**：可引入 `.env.development` 和 `.env.production` 以分离接口域名（备用）。

2. **HTTP / API 封装层**
   - **创建 `src/api` 文件目录**：集中管理所有的 URL 路径（分离 `auth.js`, `chat.js`, `plan.js` 等）。
   - **基础请求库**：安装 `axios` 或封装原生的 `fetch`，统一添加 Request Interceptor (将 localStorage里的对应 Token 注入到 Bearer Authorization)，以及 Response Interceptor (统一处理 401 和格式解析，剥离外层 `{code, message}`).

3. **状态管理层建设**
   - 之前缺失全局状态，现在涉及 `token` 以及多组件的 `user_info`，建议立即引入并配置 **Pinia** (例如 `src/stores/userStore.js`)。

4. **SSE (服务器推送事件) 流式适配**
   - 核心难点：后端大模型使用标准的 `Content-Type: text/event-stream`。前端不能通过基础 Axios 调用，必须采用类似 `@microsoft/fetch-event-source` 库，或者原生的 `fetch` 结合 `ReadableStreamDefaultReader` 循环解包，解析 `event: start/delta/done` 及对应的 JSON body 进行增量渲染与打字机效果呈现。

5. **界面增补需求**
   - 目前没有供用户填写用户名、密码登录/注册的弹窗或者独立路由页面。需要增开相关 UI 组件，保障用户获取 Token，否则聊天的核心流程处于未鉴权 401 状态。
