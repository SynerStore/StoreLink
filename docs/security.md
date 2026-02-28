# 安全评估与改进建议

下面是对当前代码库中“各种存储连接”的安全评估与改进建议，按风险面分区说明并引用关键实现位置，便于定位。

**总体结论**

- 已具备基础的静态存储安全：敏感字段（password、secretAccessKey、accessKeySecret）在落盘前统一加密，格式包含随机盐与 IV，PBKDF2(150k) 派生 AES-256 密钥，环境变量密钥支持且不硬编码。
- 运行期安全较为合理：仅在连接创建时临时解密，构造客户端后立即清除明文，解密失败则阻断连接并记录错误。
- 仍有提升空间：建议采用带认证的加密（AEAD，如 GCM 或 Encrypt-then-MAC），优化密钥来源与密钥管理（系统秘钥环），完善日志与 IPC 参数校验，以及统一对所有适配器的敏感字段做清理。

**敏感数据存储与加密**

- 启动阶段加密
  - 对 connections 中的 password、secretAccessKey、accessKeySecret 自动加密并回写。
  - 位置：确保加密与导入加密 [connections.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/db/json/connections.ts#L29-L49) 和 [connections.ts:import/merge](file:///Users/songjun/Workspace/github/StoreLink/src/main/db/json/connections.ts#L61-L71)
  - 启动挂钩：[core/index.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/core/index.ts#L31-L38)
- 加密实现与格式
  - PBKDF2(150000) + AES-256-CBC，生成随机盐和 IV；Base64 编码存储，格式 enc:v1:aes-256-cbc:<salt_b64>:<iv_b64>:<ct_b64>。
  - 位置：[secret.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/utils/secret.ts#L1-L76)
- 环境变量与密钥来源
  - 使用 STORELINK_SECRET 覆盖默认机身唯一 ID；常量不可变，避免硬编码。
  - 位置：[secret.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/utils/secret.ts#L8-L12)
- 密钥轮换
  - 解密旧值后用新密钥重新加密并写回；支持所有敏感字段。
  - 位置：[connections.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/db/json/connections.ts#L86-L111)

**运行期处理与内存清理**

- 解密时机与阻断策略
  - 在创建客户端前仅临时解密；失败记录错误并返回 decrypt_failed，阻断连接测试。
  - 位置：[storeManage.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/stores/storeManage.ts#L28-L49), [storeManage.ts:storeConnect](file:///Users/songjun/Workspace/github/StoreLink/src/main/stores/storeManage.ts#L109-L117)
- 明文清除
  - SFTP/WebDAV：连接初始化后清除 config.password。
    - [sftp/index.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/stores/adapters/sftp/index.ts#L43-L51)
    - [webdev/index.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/stores/adapters/webdev/index.ts#L38-L41)
  - OSS/S3：初始化后清除 config.secretAccessKey/accessKeySecret。
    - [oss/index.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/stores/adapters/oss/index.ts#L49-L58)
    - [s3/index.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/stores/adapters/s3/index.ts#L47-L61)
- 连接池清理
  - storePool 定时清理闲置实例并销毁客户端；减少长时间驻留内存风险。
  - 位置：[storeManage.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/stores/storeManage.ts#L70-L93)

**渲染进程与 IPC**

- 渲染进程持有 connections，但主进程存的敏感字段是加密值。
  - 位置：[useConfigStore.ts](file:///Users/songjun/Workspace/github/StoreLink/src/renderer/store/useConfigStore.ts#L20-L35)
- 连接创建流程
  - 表单收集后通过事件发送到主进程存储；主进程加密写入。
  - 表单位置（示例）：[OssForm.tsx](file:///Users/songjun/Workspace/github/StoreLink/src/renderer/components/StoreConnectModal/StoreConnectForm/OssForm.tsx)
- IPC 请求
  - storeRequest / storeConnect 走 ipcMain.handle；目前参数未显式校验与最小化。
  - 位置：[stores/index.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/stores/index.ts#L10-L52)

**日志与审计**

- 日志轮转与分离
  - app.log / app.error.log 分离且每日归档；减少日志膨胀并区分错误级别。
  - 位置：[logger.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/utils/logger.ts)
- 风险点
  - 适配器 catch 中多处直接输出 err.message；若上游错误包含敏感信息则可能被写入日志。建议统一过滤/脱敏。

**OWASP 对照与潜在改进**

- 密钥管理
  - 优点：不硬编码、可用环境变量覆盖；具备轮换能力。
  - 改进：引入系统秘钥环（Keychain/DPAPI/KWallet），优先使用系统安全存储读取 STORELINK_SECRET；fallback 再用 machine-id。
- 加密算法
  - 优点：盐/IV 随机、PBKDF2 迭代数合理。
  - 改进：采用 AEAD（如 AES-GCM）或 Encrypt-then-MAC（对密文与头部做 HMAC-SHA256 并存储 tag），防止篡改/填充攻击；CryptoJS 原生 GCM支持有限，建议引入支持 GCM 的库或在现有基础上增加 HMAC。
- 参数校验与最小化
  - 在 ipcMain.handle 的 storeRequest/storeConnect 中增加 schema 校验（例如 zod/ajv），只允许必要字段通过并对路径/前缀做校验，减少注入面。
- 日志策略
  - 统一错误日志脱敏拦截器，禁止记录连接配置对象、URI、密钥类字段；仅保留错误码与上下文ID。
- 运行期最小权限
  - 云 SDK 配置只传必要字段；已在 OSS/S3 初始化后清空敏感字段，建议将 config 对象也尽量去除非必需字段。
- 连接导入/导出
  - 已对导入做加密保护；导出 connections.json 不含明文。建议加一层签名校验（防篡改），或提供加密导出选项。

**建议的后续动作**

- 增强加密完整性
  - 在 secret.ts 中为加密结果增加 HMAC-SHA256 校验并携带 tag 字段；解密时验证 tag。
- IPC 入参校验
  - 在 [stores/index.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/stores/index.ts) 引入 schema 校验，对 id、method、params 进行类型与范围校验。
- 日志脱敏
  - 在 [logger.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/utils/logger.ts) 基础上，封装 errorLogger.error(msg, meta) 统一过滤敏感键（password、secretAccessKey、accessKeySecret）。
- 系统秘钥环支持
  - 在 [secret.ts](file:///Users/songjun/Workspace/github/StoreLink/src/main/utils/secret.ts) 增加获取系统秘钥的函数（macOS Keychain、Windows DPAPI、Linux libsecret），优先作为 BASE_SECRET 来源。
- 适配器统一清理
  - 已处理 S3/OSS/WebDAV/SFTP；检查其他适配器（如未来 COS/SMB）按同样模式处理。

如果你希望，我可以直接为加密增加 HMAC 标签（Encrypt-then-MAC），以及在 IPC 请求层引入 zod/ajv 的参数校验，并加上统一的日志脱敏中间层。
