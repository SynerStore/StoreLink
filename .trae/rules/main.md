# SynerStoreClient (store-link) Trae 编辑器规则

## 1. 项目概览
- **项目名称**: SynerStoreClient (store-link)
- **类型**: Electron 桌面应用程序
- **技术栈**:
  - **核心**: Electron, TypeScript
  - **打包工具**: Rspack
  - **前端**: React, Ant Design, Zustand, CSS Modules
  - **后端 (主进程)**: Node.js, SQLite/LowDB, 云存储 SDK (AWS S3, AliOSS 等)

## 2. 架构指南

### 目录结构
- `src/main`: 后端逻辑 (Node.js/Electron)。
  - `stores/adapters`: 存储提供商实现 (适配器模式)。
  - `events`: IPC 事件处理程序。
  - `db`: 数据库访问 (SQLite/JSON)。
- `src/renderer`: 前端 UI (React)。
  - `components`: 可复用 UI 组件。
  - `pages`: 主要视图页面。
  - `store`: Zustand 状态管理。
- `scripts`: 构建配置 (Rspack)。

### 设计模式
- **适配器模式 (Adapter Pattern)**: 所有存储提供商必须实现 `src/main/stores/store.ts` 中定义的通用接口。
- **IPC 通信**: 使用 `src/main/events` 定义主进程处理程序。渲染进程通过 `window.electron` 桥接触发这些事件 (查看 `preload.ts`)。
- **状态管理**: 使用 `zustand` 进行全局前端状态管理。

## 3. 代码规范

### TypeScript
- 使用 `interface` 定义对象，使用 `type` 定义联合类型/原始类型。
- 尽量避免使用 `any`；使用严格类型。
- 显式定义复杂函数的返回类型。

### React (渲染进程)
- 使用 **函数式组件 (Functional Components)** 和 Hooks。
- 使用 **Ant Design** 组件作为 UI 基础。
- 使用 **CSS Modules** (`*.module.css`) 进行组件级样式隔离。
- 使用 `i18next` 处理所有文本字面量以支持国际化。

### Electron (主进程)
- 保持主进程响应迅速；如有必要，将繁重任务卸载到 Worker。
- 使用 `electron-log` 进行日志记录。
- 保护 IPC 通道；验证来自渲染进程的所有输入。

## 4. 文件命名与格式化
- **组件**: `PascalCase.tsx` (例如 `FileViewer.tsx`) 或文件夹中的 `index.tsx` (例如 `FileViewer/index.tsx`)。
- **函数/Hooks**: `camelCase.ts` (例如 `useConfigStore.ts`)。
- **类**: `PascalCase.ts`。
- **常量**: `UPPER_CASE`。
- **格式化**: 遵循 Prettier 配置 (2 空格缩进, 单引号, 分号)。

## 5. 测试
- 使用 **Vitest** 进行单元测试和集成测试。
- 将测试放置在 `tests/` 目录中，或与源文件并置（单元测试）。
- 测试适配器时 Mock 外部依赖 (S3, OSS)。

## 6. 性能与最佳实践
- **懒加载**: 对重型视图使用 `React.lazy`。
- **Rspack**: 修改 `scripts/rspack.*.config.ts` 进行构建优化。
- **依赖管理**: 使用 `pnpm` 进行包管理。
- **错误处理**: 在渲染进程中使用全局错误边界 (Error Boundaries)，在主进程适配器中使用 try-catch 块。
