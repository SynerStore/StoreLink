import { ResponseData } from '@/main/utils';

export interface IStorageHandler {
  init?(config: any): void;
  destroy?(): void;
  test?(): Promise<ResponseData<any>>;
  list?(params: any): Promise<ResponseData<any>>;
  listDir?(params: any): Promise<ResponseData<any>>;
  get?(params: any, onProgress?: any): Promise<ResponseData<any>>;
  getMulti?(params: any): Promise<ResponseData<any>>;
  put?(params: any, onProgress?: any): Promise<ResponseData<any>>;
  putFolder?(params: any): Promise<ResponseData<any>>;
  delete?(...params: any): Promise<ResponseData<any>>;
  deleteMulti?(params: any): Promise<ResponseData<any>>;
  rename?(params: any): Promise<ResponseData<any>>;
  copy?(params: any): Promise<ResponseData<any>>;
  statistic?(params: any): Promise<ResponseData<any>>;
  getSourceUrl?(params: any): Promise<ResponseData<any>>;
}
