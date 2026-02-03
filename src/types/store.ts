export enum StoreTypes {
  S3 = 's3',
  OSS = 'oss',
  COS = 'cos',
  SFTP = 'sftp',
  LOCAL = 'local',
  WEBDAV = 'webdav',
  SYNOLOGY = 'synology',
}

export enum StoreBrands {
  S3 = 's3',
  aliyun = 'aliyun',
  local = 'local',
  sftp = 'sftp',
  tencentcloud = 'tencentcloud',
  huaweicloud = 'huaweicloud',
  WebDAV = 'WebDAV',
  synology = 'synology',
}

export enum StoreConnectStatus {
  unexec = 'unexec',
  success = 'success',
  fail = 'fail',
}

export interface TStoreObject {
  key: string | undefined | null; // 文件路径
  name: string | undefined | null; // 文件名
  lastModified: Date | string | number | undefined | null; // 文件的修改时间
  size: number | undefined | null; // 文件大小
  etag: string | undefined | null; // 文件的MD5值
  storageClass: string | undefined; // 文件存储类型
  isDirectory?: boolean; // 是否是文件夹
  mime?: string | false; // 文件类型
  isSymbolicLink?: boolean; // 是否是符号链接
}
