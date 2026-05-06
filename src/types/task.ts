export enum ETaskStatus {
  PENDING = 'pending',
  SCANNING = 'scanning',
  RUNNING = 'running',
  RETRYING = 'retrying',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

export enum ETaskType {
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  DELETE = 'delete',
  RENAME = 'rename',
  COPY = 'copy',
  CREATE_DIR = 'create_dir',
  TRANSFER = 'transfer',
}
