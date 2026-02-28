# Electron 版本升级方案

## 📊 当前项目版本分析

| 依赖项 | 当前版本 | 备注 |
|--------|----------|------|
| Electron | **36.9.5** | 当前最新稳定版 |
| React | 18.3.1 | 稳定版 |
| rspack | 1.2.6 | 较新版本 |
| TypeScript | 5.7.3 | 稳定版 |
| electron-builder | 26.0.12 | 较新版本 |
| zustand | 5.0.3 | 较新版本 |
| antd | 6.2.1 | 较新版本 |

---

## 🎯 目录

1. [用户端版本升级机制](#用户端版本升级机制) - 让用户感知新版本并升级
2. [Electron 版本升级](#electron-版本升级-3695) - 技术栈版本升级

---

## 📱 用户端版本升级机制

### 功能概述

已实现用户端的版本升级功能，用户可以：

- ✅ 启动应用时自动检测新版本
- ✅ 在设置页面手动检查更新
- ✅ 查看更新日志
- ✅ 下载并安装新版本

### 已创建的文件

```
src/
├── main/
│   └── services/
│       └── update.ts          # 更新服务（后端）
├── renderer/
│   └── components/
│       └── UpdateTip/         # 更新提示组件
│           ├── index.tsx
│           └── index.css
│   └── hooks/
│       └── useUpdate.ts       # 更新状态管理 Hook
└── types/
    └── update.ts              # 更新类型定义
```

### 使用方式

1. **设置页面**: 用户可以在设置页面看到当前版本号，并点击"检查更新"按钮
2. **自动检测**: 应用启动后会自动检测新版本，发现新版本会弹出提示
3. **更新流程**: 
   - 检查更新 → 显示新版本信息 → 下载 → 安装

### 配置版本检测服务器

已默认使用 GitHub Releases 作为版本检测源，**无需自建服务器**！

只需修改 `src/main/services/update.ts` 中的仓库地址即可：

```typescript
// 第 23 行
private githubRepo = 'chrissong1994/StoreLink'; // 替换为你的 GitHub 仓库
```

### 更新服务器要求

不需要！GitHub Releases 会自动提供以下数据：
- 版本号（从 tag name 获取）
- 发布日期
- 更新日志（release body）
- 安装包大小
- 下载链接

### GitHub Releases 发布要求

1. 创建 GitHub Release，添加 tag（如 `v1.0.0`）
2. 上传安装包（`.dmg`、`.exe`、`.zip` 等）
3. 在更新日志中描述更新内容

### 打包配置

确保 `electron-builder` 配置正确，生成可分发的安装包：

```javascript
// scripts/make.js
{
  mac: {
    target: ['dmg:x64', 'dmg:arm64'],
  },
  win: {
    target: ['nsis:x64', 'nsis:arm64'],
  }
}
```

---

## 💻 Electron 版本升级 (36.9.5)

#### 推荐升级路径

- **方案 A**: 升级到 Electron 38.x（最新稳定版）
- **方案 B**: 保持 36.x 并关注后续 LTS 版本

#### 升级步骤

```bash
# 1. 更新 package.json 中的 electron 版本
npm install electron@38 --save-dev

# 2. 更新 electron-builder
npm install electron-builder@latest --save-dev

# 3. 重新安装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 4. 重新构建原生模块
npm run rebuild
```

#### 需要注意的 API 变更

- Electron 37+ 移除了部分废弃 API
- 需要检查 `webUtils.getPathForFile` 的兼容性
- IPC 通信方式建议使用 contextBridge（你已经在使用）

---

### 2. 关联依赖升级

#### 推荐版本组合

| 依赖项 | 当前版本 | 推荐升级到 |
|--------|----------|------------|
| electron | 36.9.5 | 38.x |
| electron-builder | 26.0.12 | 25.x+ |
| @rspack/cli | 1.2.6 | 1.2.x (最新) |
| @rspack/core | 1.2.6 | 1.2.x (最新) |
| react | 18.3.1 | 18.3.x (保持) |
| react-dom | 18.3.1 | 18.3.x (保持) |
| typescript | 5.7.3 | 5.7.x (保持) |
| zustand | 5.0.3 | 5.0.x (保持) |
| antd | 6.2.1 | 6.x (保持) |

---

### 3. 构建配置更新

#### rspack 配置优化

```typescript
// scripts/rspack.main.config.ts
const config: Configuration = {
  // ... existing config
  target: 'electron-main',  // 确认保持不变
  externals: {
    ssh2: 'commonjs ssh2',
    piscina: 'commonjs piscina',
    'cpu-features': 'commonjs cpu-features',
    'ssh2-sftp-client': 'commonjs ssh2-sftp-client',
  },
};
```

#### electron-builder 配置建议

```javascript
// scripts/make.js
const cfg_common = {
  // ... existing config
  electronDownload: {
    cache: path.join(homedir, '.electron'),
    mirror: 'https://registry.npmmirror.com/-/binary/electron/',
  },
  // 新增配置
  nodeGypRebuild: false,
  npmRebuild: false,
  buildDependenciesFromSource: false,
};
```

---

## 🔧 升级检查清单

### 升级前

- [ ] 备份当前项目
- [ ] 记录所有自定义 Electron 配置
- [ ] 检查第三方库的 Electron 兼容性

### 升级中

- [ ] 更新 package.json 版本号
- [ ] 删除 node_modules 和 lock 文件
- [ ] 重新安装依赖
- [ ] 运行 `npm run rebuild` 重建原生模块

### 升级后

- [ ] 运行 `npm run dev` 验证开发模式
- [ ] 运行 `npm run build` 验证构建
- [ ] 测试所有主要功能：
  - [ ] 文件上传/下载
  - [ ] 多窗口管理
  - [ ] 系统托盘
  - [ ] 本地存储
- [ ] 运行 `npm run make` 验证打包

---

## ⚠️ 潜在问题与解决方案

### 1. 原生模块编译失败

```bash
# 解决方案
npm install -g node-gyp
npm run rebuild
```

### 2. electron-builder 打包失败

```bash
# 检查配置
npx electron-builder --dir
# 清理缓存
rm -rf dist node_modules/.cache
```

### 3. 运行时错误

- 检查 Node.js 版本（推荐 20.x LTS）
- 确认所有依赖支持新的 Electron 版本

---

## 📈 推荐升级顺序

1. **第一步**: 更新 TypeScript 和开发工具链

   ```bash
   npm install typescript@latest @rspack/cli@latest @rspack/core@latest
   ```

2. **第二步**: 更新 electron 和 electron-builder

   ```bash
   npm install electron@38 electron-builder@latest --save-dev
   ```

3. **第三步**: 更新 UI 库

   ```bash
   npm install react@latest react-dom@latest zustand@latest antd@latest
   ```

4. **第四步**: 完整测试

   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   npm run dev
   ```

---

## 🔍 版本监控资源

- [Electron Release](https://www.electronjs.org/releases)
- [Electron Changelog](https://github.com/electron/electron/releases)
- [rspack Releases](https://github.com/web-infra-dev/rspack/releases)
- [electron-builder Releases](https://github.com/electron-userland/electron-builder/releases)

---

## 📝 注意事项

1. **Electron 36.9.5 已经是较新版本**，如果不急于使用新特性，可以等待更稳定的版本
2. **rspack 1.2.6 版本较新**，升级需谨慎测试
3. **项目中使用了较多原生模块**（ssh2, piscina），升级后需要重新编译
4. **electron-store 10.x** 使用了新的配置方式，注意兼容

---

## 📋 快速升级命令

```bash
# 一键升级 Electron 核心依赖
npm install electron@latest electron-builder@latest @rspack/cli@latest @rspack/core@latest --save-dev

# 清理并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 重建原生模块
npm run rebuild

# 测试构建
npm run build && npm run make
```

## 🎉 升级完成确认

升级完成后，请验证以下功能正常工作：

- [ ] 应用启动正常
- [ ] 窗口创建和关闭正常
- [ ] IPC 通信正常
- [ ] 本地存储读写正常
- [ ] 文件系统操作正常
- [ ] 打包发布正常

---

**文档版本**: 1.0
**创建日期**: 2026-02-28
