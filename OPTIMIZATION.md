# 项目优化建议与分析

本文档基于对 SynerStoreClient (StoreLink) 源码的深入分析，从代码质量、性能、用户体验和工程化四个维度提出优化建议。

## 1. 架构与代码质量 (Architecture & Code Quality)

### 1.1 减少代码重复 (DRY)
目前 `src/renderer/components/StoreViewer/` 下的各个 Viewer 组件（如 `S3Viewer`, `OssViewer`, `LocalViewer` 等）存在大量重复逻辑。
*   **现状**: `handleGetObjects` (加载列表), `handlePathBack/Forward` (路径导航), `useEffect` (快捷键绑定), `useFileTransfer` (文件传输) 等逻辑在每个组件中都重复实现。
*   **建议**: 提取通用逻辑到自定义 Hook `useStoreViewer`。
    ```typescript
    // 示例伪代码
    const useStoreViewer = (connectionId, adapterType) => {
      const { dataList, loading, refresh } = useFileList(connectionId);
      const { currentPath, history, goBack, goForward } = usePathHistory();
      const { selection, selectAll } = useSelection(dataList);
      
      // 统一处理快捷键
      useShortcuts({
        'ctrl+a': selectAll,
        'backspace': goBack
      });

      return { dataList, loading, currentPath, ... };
    };
    ```

### 1.2 强化 TypeScript 类型定义
项目中使用 `any` 的情况较为普遍，特别是在 IPC 通信数据和第三方 SDK 返回值处理上。
*   **建议**:
    *   完善 `TStoreObject` 定义，确保涵盖所有存储适配器的返回字段。
    *   为 IPC 事件参数和返回值定义严格的接口（利用 `trpc` 或手动维护类型共享文件）。
    *   开启 `tsconfig.json` 中的 `noImplicitAny: true` 逐步修复类型报错。

### 1.3 统一错误处理
*   **现状**: 错误处理散落在各个组件的 `try-catch` 块中，部分错误信息直接透传给用户。
*   **建议**: 建立全局错误处理机制。
    *   **后端**: 统一封装 `ServiceError` 类，区分业务错误和系统错误。
    *   **前端**: 使用 `ErrorBoundary` 捕获渲染错误，使用全局 `Interceptor` 拦截请求错误并统一展示 Toast/Modal。

## 2. 性能优化 (Performance)


### 2.2 大目录分页与按需加载
*   **现状**: `list` 接口似乎倾向于全量获取或由 SDK 默认行为决定（通常 SDK 有默认分页，如 S3 默认 1000 条）。前端通过 `handleGetObjects` 获取数据。
*   **建议**:
    *   在 `IStorageHandler` 接口中明确增加 `pagination` 参数 (token/marker 机制)。
    *   前端实现“无限滚动” (Infinite Scroll) 或“加载更多”按钮，避免一次性渲染过多数据。

### 2.3 IPC 通信优化
*   **现状**: 频繁的文件传输进度更新可能会阻塞主进程或渲染进程的 UI 线程。
*   **建议**:
    *   降低进度事件发送频率（例如每 500ms 或进度变化 > 1% 时发送一次）。
    *   考虑将重型 I/O 操作移至独立的 `Worker` 线程（项目中已有 `storage.worker.ts`，需确保其充分利用）。

## 3. 用户体验 (UI/UX)

### 3.1 视觉反馈优化
*   **骨架屏**: 在文件列表加载时，使用 Skeleton 骨架屏代替简单的 `Spin` 加载圈，提升感知体验。
*   **拖拽反馈**: 拖拽文件到应用内时，提供更明显的放置区域高亮提示。

### 3.2 任务管理增强
*   **现状**: 任务列表提供了基本的暂停/开始/删除功能。
*   **建议**:
    *   增加“传输完成通知”（系统级通知）。
    *   增加“重试失败任务”的一键操作。
    *   在任务列表中显示更详细的错误原因。

## 4. 工程化 (Engineering)

### 4.1 测试体系建设
*   **现状**: 项目缺乏自动化测试。
*   **建议**:
    *   **单元测试**: 使用 `Vitest` 对 `src/main/utils` 和核心算法进行测试。

### 4.3 依赖管理
*   **依赖清理**: 检查 `package.json`，移除未使用的依赖，将仅构建时需要的依赖严格移入 `devDependencies`。
*   **安全扫描**: 定期运行 `npm audit` 检查依赖漏洞。
