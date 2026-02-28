# 开发指南

本文档旨在帮助开发者了解 StoreLink (StoreLink) 的核心架构、代码逻辑以及工程构建流程。

## 1. 项目简介

StoreLink (StoreLink) 是一个基于 Electron + React 的跨平台多存储管理工具。它支持管理本地文件系统以及多种云存储服务（如阿里云 OSS、腾讯云 COS、AWS S3、SFTP、WebDAV、群晖 Synology 等）。

## 2. 核心架构

项目采用标准的 Electron 双进程架构：**Main Process (主进程)** 和 **Renderer Process (渲染进程)**。

### 2.1 目录结构

```
├── build/                  # 构建产物目录
├── scripts/                # 构建与打包脚本
├── src/
│   ├── main/               # 主进程代码
│   │   ├── core/           # 核心应用类 (生命周期管理)
│   │   ├── db/             # 本地数据库 (LowDB/SQLite)
│   │   ├── events/         # IPC 事件注册与处理
│   │   ├── stores/         # 存储适配器与管理逻辑
│   │   ├── tasks/          # 任务管理 (上传/下载/传输)
│   │   ├── utils/          # 工具函数
│   │   └── windows/        # 窗口管理
│   ├── renderer/           # 渲染进程代码 (React)
│   │   ├── components/     # 通用组件
│   │   ├── pages/          # 页面入口
│   │   ├── StoreViewer/    # 核心文件浏览器组件
│   │   └── store/          # 前端状态管理 (Zustand)
│   └── types/              # TypeScript 类型定义
├── package.json            # 项目依赖与脚本
└── scripts/
    ├── rspack.main.config.ts    # Rspack 主进程构建配置
    └── rspack.render.config.ts  # Rspack 渲染进程构建配置
```

### 2.2 主进程 (Main Process)

主进程负责应用生命周期、原生窗口管理、以及所有的文件存储操作。

*   **入口**: [src/main/index.ts](file:///Users/songjun/WorkSpace/github/StoreLink/src/main/index.ts) 初始化 `Core` 类。
*   **Core 类**: [src/main/core/index.ts](file:///Users/songjun/WorkSpace/github/StoreLink/src/main/core/index.ts)
    *   管理应用启动流程 (`startApp`, `beforeAppReady`, `afterAppReady`)。
    *   注册 IPC 事件 (`resistry`)。
    *   初始化窗口管理器 (`Windows`) 和 Viewer 管理器 (`ViewerWindowManager`)。
*   **存储管理**: [src/main/stores/storeManage.ts](file:///Users/songjun/WorkSpace/github/StoreLink/src/main/stores/storeManage.ts)
    *   维护 `storePool` (连接池)。
    *   根据连接配置 (`StoreTypes`) 创建对应的存储客户端实例。
    *   处理配置解密 (Password/SecretKey)。
*   **适配器模式**: `src/main/stores/adapters/`
    *   定义统一接口 `IStorageHandler` ([src/main/stores/adapters/store.ts](file:///Users/songjun/WorkSpace/github/StoreLink/src/main/stores/adapters/store.ts))。
    *   实现不同存储的适配器：`S3Store`, `OssStore`, `LocalStore`, `SftpStore` 等。
    *   统一实现了 `list`, `put`, `get`, `delete`, `rename` 等标准文件操作。

### 2.3 渲染进程 (Renderer Process)

渲染进程基于 React + Ant Design 构建，使用 Rspack 进行打包。

*   **多窗口支持**:
    *   `render_main`: 主窗口。
    *   `render_launch`: 启动窗口。
    *   `render_viewer`: 文件浏览窗口。
*   **StoreViewer**: [src/renderer/components/StoreViewer/index.tsx](file:///Users/songjun/WorkSpace/github/StoreLink/src/renderer/components/StoreViewer/index.tsx)
    *   核心组件，根据传入的 `connection.type` 动态渲染对应的 Viewer 组件 (如 `S3Viewer`, `LocalViewer`)。
    *   处理文件拖拽上传逻辑。
*   **状态管理**: 使用 Zustand (`useConfigStore`) 管理全局配置和连接信息。

## 3. 工程设计与构建

项目使用 **Rspack** 作为构建工具，以提高构建速度，使用 **Electron Builder** 进行应用打包。

### 3.1 构建配置

*   **Rspack**:
    *   [scripts/rspack.main.config.ts](file:///Users/songjun/WorkSpace/github/StoreLink/scripts/rspack.main.config.ts): 编译主进程代码，输出到 `build/[name].js`。支持 TypeScript 和 SWC Loader。
    *   [scripts/rspack.render.config.ts](file:///Users/songjun/WorkSpace/github/StoreLink/scripts/rspack.render.config.ts): 编译渲染进程代码，输出到 `build/`。支持 React Refresh (HMR) 和 CSS Modules。
*   **Electron Builder**:
    *   [scripts/make.js](file:///Users/songjun/WorkSpace/github/StoreLink/scripts/make.js): 自定义打包脚本。
    *   在打包前 (`beforeMake`) 会清理并重建 `build/` 目录，生成仅包含生产依赖的临时 `package.json`，以减小包体积。
    *   支持多平台打包 (Mac, Windows, Linux)。

### 3.2 关键依赖

*   **UI**: `react`, `antd`, `@ant-design/icons`, `@emotion/react`
*   **Storage SDKs**: `ali-oss`, `@aws-sdk/client-s3`, `cos-nodejs-sdk-v5`, `ssh2-sftp-client`
*   **Build**: `@rspack/core`, `electron-builder`, `typescript`
*   **Utils**: `fs-extra`, `lodash`, `crypto-js`

## 4. 开发流程

### 4.1 环境准备
*   Node.js (建议 LTS 版本)
*   pnpm (推荐) 或 npm

### 4.2 启动开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器 (同时启动 Main 和 Renderer 进程)
npm run dev
```
`npm run dev` 会并行执行 `dev:renderer` (Rspack Serve) 和 `dev:main` (Rspack Watch)。

### 4.3 构建与打包
```bash
# 构建生产环境代码
npm run build

# 打包应用 (根据当前系统)
npm run make

# 指定平台打包
npm run make:mac
npm run make:win
npm run make:linux
```

## 5. 代码规范
*   **TypeScript**: 全面使用 TypeScript 编写。
*   **Prettier**: 代码格式化配置在 `package.json` 中，可通过 `npm run prettier` 运行。
*   **组件化**: UI 组件按功能拆分，Store Viewer 采用策略模式适配不同存储类型。

## 6. 项目优化建议
详细的优化分析与建议请参考 [OPTIMIZATION.md](./OPTIMIZATION.md) 文档。
