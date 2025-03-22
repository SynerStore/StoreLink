import { ResponseData } from '@/main/utils';

export interface IStorageHandler {
  init(config: any): void;
  test(): Promise<ResponseData<any>>;
  list(params: any): Promise<ResponseData<any>>;
  get(params: any): Promise<ResponseData<any>>;
  getMulti(params: any): Promise<ResponseData<any>>;
  put(params: any): Promise<ResponseData<any>>;
  putFolder(params: any): Promise<ResponseData<any>>;
  delete(params: any): Promise<ResponseData<any>>;
  deleteMulti(params: any): Promise<ResponseData<any>>;
  rename(params: any): Promise<ResponseData<any>>;
  statistic(params: any): Promise<ResponseData<any>>;
}
