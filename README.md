# Agent Front

一个基于 Vue 3 + Vite 的智能聊天代理前端应用。

## 项目描述

Agent Front 是一个现代化的前端应用，专为与智能聊天代理进行交互而设计。应用提供了用户友好的界面，支持实时聊天、历史记录管理、用户认证等功能。

## 功能特性

- **实时聊天**: 支持与后端代理的实时对话，使用 Server-Sent Events (SSE) 实现流式响应。
- **用户认证**: 提供登录和注册功能，确保用户数据的安全性。
- **聊天历史**: 保存和管理用户的聊天记录，便于回顾和继续对话。
- **Markdown 支持**: 聊天内容支持 Markdown 渲染，提供丰富的文本格式。
- **响应式设计**: 适配不同设备，提供良好的用户体验。
- **代码高亮**: 集成 Highlight.js，支持代码块的高亮显示。

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **SSE 客户端**: @microsoft/fetch-event-source
- **Markdown 解析**: markdown-it, marked
- **代码高亮**: highlight.js
- **安全**: DOMPurify

## 安装步骤

### 前置要求

- Node.js (版本 16 或更高)
- npm 或 yarn

### 安装依赖

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

## 运行项目

### 开发模式

```bash
npm run dev
```

这将在 `http://localhost:5173` 启动开发服务器。

### 构建生产版本

```bash
npm run build
```

构建后的文件将位于 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
agent-front/
├── public/                 # 静态资源
├── src/
│   ├── api/                # API 接口
│   │   ├── chat.js         # 聊天相关 API
│   │   └── request.js      # 通用请求工具
│   ├── assets/             # 资源文件
│   ├── components/         # Vue 组件
│   │   ├── AppFooter.vue   # 应用底部
│   │   ├── AppHeader.vue   # 应用头部
│   │   ├── AuthModal.vue   # 认证模态框
│   │   ├── ChatHistory.vue # 聊天历史
│   │   ├── ChatTable.vue   # 聊天表格
│   │   ├── HelloWorld.vue  # 示例组件
│   │   ├── HomeSkeleton.vue # 主页骨架屏
│   │   └── PlanModal.vue   # 计划模态框
│   ├── layout/             # 布局组件
│   │   ├── AuthLayout.vue  # 认证布局
│   │   ├── BasicLayout.vue # 基础布局
│   │   └── ChatLayout.vue  # 聊天布局
│   ├── stores/             # Pinia 状态管理
│   │   ├── index.js        # 状态管理入口
│   │   └── userStore.js    # 用户状态
│   ├── utils/              # 工具函数
│   │   └── storage.js      # 本地存储工具
│   ├── views/              # 页面视图
│   │   ├── ChatView.vue    # 聊天页面
│   │   └── FaceView.vue    # 人脸页面
│   ├── App.vue             # 根组件
│   ├── main.js             # 应用入口
│   ├── router.js           # 路由配置
│   └── style.css           # 全局样式
├── docs/                   # 项目文档
│   ├── api-requirements.md # API 需求
│   ├── integration-plan.md # 集成计划
│   ├── project-analysis.md # 项目分析
│   └── sse-guide.md        # SSE 指南
├── index.html              # HTML 入口
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置
└── README.md               # 项目说明
```

## 文档

详细的文档位于 `docs/` 目录：

- [API 需求](docs/api-requirements.md)
- [集成计划](docs/integration-plan.md)
- [项目分析](docs/project-analysis.md)
- [SSE 指南](docs/sse-guide.md)

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系我们。
