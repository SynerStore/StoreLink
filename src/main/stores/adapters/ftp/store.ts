import { Client } from 'basic-ftp';

import { sucessResponse, errorResponse, sleep, isObjectFolder } from '@/main/utils';
import { IStorageHandler } from '../store';
import {
  list,
  ListParams,
  deleteFile,
  DeleteFileParams,
  deleteFolder,
  DeleteFolderParams,
  rename,
  RenameParams,
  putFile,
  PutFileParams,
  putFolder,
  PutFolderParams,
  GetSourceUrlParams,
  getSourceUrl,
  getFolder,
  GetFileParams,
  getFile,
  GetFolderParams,
} from './api';
import { storeRemove, storePool } from '../../storeManage';

class FtpStore implements IStorageHandler {
  public config: any;
  public client: any;
  // private connecting: boolean;
  public id: string;
  constructor(id: string, config: any) {
    this.id = id;
    this.config = config;
    this.client = new Client();
  }

  async init(config: any) {
    const { host, port, user, password } = config;
    // 针对 basic-ftp 单线程模型处理
    if (this.client && this.client.ftp.closed) {
      try {
        await this.client.access({
          host,
          port,
          user,
          password,
          secure: true, // 启用 FTPS
          secureOptions: { rejectUnauthorized: false },
        });
      } catch (err) {
        console.log(err);
      }
      return;
    }
  }

  // 销毁
  destroy() {
    this.client.close();
    // storeRemove(this.id);
  }

  async reConnect() {
    this.client.close();
    await this.ensureClientIsOpen();
  }

  async ensureClientIsOpen() {
    if (!this.client.ftp.closed) {
      return;
    }
    await this.init(this.config);
  }
  //   需要获取权限 如何通过系统询问访问
  async test() {
    try {
      await this.client.list('/');
      return sucessResponse(true);
    } catch (error: any) {
      return errorResponse(error.message);
    } finally {
      this.release();
    }
  }

  async list(params: ListParams) {
    try {
      await this.ensureClientIsOpen();
      const result = await list(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      console.log(err);
      return errorResponse(err.message);
    } finally {
      this.release();
    }
  }

  // 下载
  async get(params: GetFolderParams & GetFileParams) {
    try {
      let result;
      if (isObjectFolder(params.key)) {
        result = await getFolder(this.client, params);
      } else {
        result = await getFile(this.client, params);
      }
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    } finally {
      this.release();
    }
  }

  async put(params: PutFileParams) {
    try {
      await this.ensureClientIsOpen();
      const result = await putFile(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    } finally {
      this.release();
    }
  }

  async putFolder(params: PutFolderParams) {
    try {
      await this.ensureClientIsOpen();
      const result = await putFolder(this.client, params);
      await this.reConnect(); // 重连避免目录权限问题
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    } finally {
      this.release();
    }
  }

  // 删除
  async delete(params: DeleteFileParams | DeleteFolderParams) {
    try {
      let result;
      if (params.isDirectory) {
        result = await deleteFolder(this.client, params);
      } else {
        result = await deleteFile(this.client, params);
      }
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    } finally {
      this.release();
    }
  }

  // // 批量删除
  // async deleteMulti(params: DeleteMultiFilesParams) {
  //   try {
  //     const result = await deleteMultiFiles(params);
  //     return sucessResponse(result);
  //   } catch (err: any) {
  //     console.error(err);
  //     return errorResponse(err.message);
  //   }
  // }

  async rename(params: RenameParams) {
    try {
      const result = await rename(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    } finally {
      this.release();
    }
  }

  // 获取资源地址
  async getSourceUrl(params: GetSourceUrlParams) {
    try {
      const result = await getSourceUrl(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    } finally {
      this.release();
    }
  }

  // 释放当前 ftp store
  release() {
    // storePool.get(this.id).releaseStore(this);
  }
}

export default FtpStore;
