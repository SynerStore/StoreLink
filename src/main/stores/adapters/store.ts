import { ResponseData } from '@/main/utils';

export interface IStorageHandler {
  init?(config: any): void;
  test?(): Promise<ResponseData<any>>;
  list?(params: any): Promise<ResponseData<any>>;
  get?(params: any): Promise<ResponseData<any>>;
  getMulti?(params: any): Promise<ResponseData<any>>;
  put?(params: any): Promise<ResponseData<any>>;
  putFolder?(params: any): Promise<ResponseData<any>>;
  delete?(params: any): Promise<ResponseData<any>>;
  deleteMulti?(params: any): Promise<ResponseData<any>>;
  rename?(params: any): Promise<ResponseData<any>>;
  statistic?(params: any): Promise<ResponseData<any>>;
}

export interface TStoreObject {
  key: string | undefined; // 文件路径
  name: string | undefined; // 文件名
  lastModified: Date | number | undefined; // 文件的修改时间
  size: number | undefined; // 文件大小
  etag: string | undefined; // 文件的MD5值
  storageClass: string | undefined; // 文件存储类型
  isDirectory?: boolean; // 是否是文件夹
  mime?: string | false; // 文件类型
  isSymbolicLink?: boolean; // 是否是符号链接
}
