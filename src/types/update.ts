/**
 * 版本更新类型定义
 */

export interface UpdateInfo {
  /** 最新版本号 */
  version: string;
  /** 发布日期 */
  releaseDate: string;
  /** 更新日志 */
  releaseNotes: string;
  /** 更新文件大小 */
  size?: number;
  /** 下载链接 */
  downloadUrl?: string;
  /** 是否强制更新 */
  mandatory?: boolean;
  /** 最低支持版本（强制更新用） */
  minimumVersion?: string;
}

export interface UpdateProgress {
  /** 已下载字节数 */
  transferred: number;
  /** 总字节数 */
  total: number;
  /** 下载百分比 */
  percent: number;
  /** 当前速度 (bytes/s) */
  bytesPerSecond: number;
}

export enum EUpdateStatus {
  /** 空闲/无更新 */
  IDLE = 'idle',
  /** 检查中 */
  CHECKING = 'checking',
  /** 有可用更新 */
  AVAILABLE = 'available',
  /** 无可用更新 */
  NO_UPDATE = 'no_update',
  /** 下载中 */
  DOWNLOADING = 'downloading',
  /** 下载完成 */
  DOWNLOADED = 'downloaded',
  /** 安装中 */
  INSTALLING = 'installing',
  /** 更新失败 */
  ERROR = 'error',
}

export interface UpdateState {
  /** 当前状态 */
  status: EUpdateStatus;
  /** 最新版本信息 */
  updateInfo?: UpdateInfo;
  /** 下载进度 */
  progress?: UpdateProgress;
  /** 错误信息 */
  error?: string;
}

/**
 * 更新频道名称
 */
export enum EUpdateChannels {
  /** 检查更新 */
  CHECK_UPDATE = 'update:check',
  /** 开始下载 */
  START_DOWNLOAD = 'update:download',
  /** 安装更新 */
  INSTALL_UPDATE = 'update:install',
  /** 获取更新状态 */
  GET_STATUS = 'update:status',
  /** 更新进度 */
  PROGRESS = 'update:progress',
  /** 更新状态变化 */
  STATUS_CHANGED = 'update:statusChanged',
}
