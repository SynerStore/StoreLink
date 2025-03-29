import { Client } from 'basic-ftp';

import { sucessResponse, errorResponse, sleep } from '@/main/utils';
import { IStorageHandler } from '../store';
import {
  list,
  ListParams,
  deleteFile,
  DeleteFileParams,
  DeleteMultiFilesParams,
  deleteFolder,
  DeleteFolderParams,
  rename,
  RenameParams,
  putFile,
  PutFileParams,
  putFolder,
  PutFolderParams,
} from './api';

class FtpStore implements IStorageHandler {
  public config: any;
  public client: any;
  private connecting: boolean;
  constructor(config: any) {
    this.config = config;
    this.client = new Client();
    this.connecting = false;
    this.init(this.config);
  }

  async init(config: any) {
    const { host, port, user, password } = config;
    // 针对 basic-ftp 单线程模型处理
    if (this.client && this.client.closed && this.connecting) {
      await sleep(100, () => !this.client.closed);
      this.connecting = false;
      return;
    } else {
      this.connecting = true;
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
    }
  }

  async reConnect() {
    this.client.close();
    await this.ensureClientIsOpen();
  }

  async ensureClientIsOpen() {
    if (!this.client.closed) {
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
    }
  }

  async put(params: PutFileParams) {
    try {
      await this.ensureClientIsOpen();
      const result = await putFile(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
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
    }
  }
}

export default FtpStore;
