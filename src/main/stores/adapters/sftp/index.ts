import SftpClient from 'ssh2-sftp-client';

import { sucessResponse, errorResponse, isObjectFolder } from '@/main/utils';
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

class SftpStore implements IStorageHandler {
  public config: any;
  public client: SftpClient;
  public id: string;
  private connected: boolean;
  constructor(id: string, config: any) {
    this.id = id;
    this.config = config;
    this.client = new SftpClient();
    this.connected = false;
    // this.init(this.config);
  }

  async init(config: any) {
    const { host, port, username, password } = config;
    // 存在 privateKey 或者 passphrase 就添加到 connect
    try {
      await this.client.connect({
        host,
        port,
        username,
        password,
        keepaliveInterval: 15000,
      } as any);
      this.connected = true;
      // 清除内存中的明文密码
      try {
        this.config.password = undefined;
      } catch (_e) {}
    } catch (_err) {
      this.connected = false;
    }

    this.client.on('end', () => {
      this.connected = false;
      console.log('Connection ended unexpectedly');
    });
    this.client.on('close', () => {
      this.connected = false;
      console.log('Connection closed');
    });
    this.client.on('error', (err: any) => {
      console.error('SFTP 客户端错误:', err.message, err.stack);
    });
  }

  destroy() {
    this.client.end();
  }

  private async ensureClientIsOpen() {
    if (this.connected) return;
    await this.init(this.config);
  }

  async test() {
    try {
      await this.ensureClientIsOpen();
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
      return errorResponse(err.message);
    }
  }

  async get(params: GetFolderParams & GetFileParams) {
    try {
      await this.ensureClientIsOpen();
      let result;
      if (isObjectFolder(params.key)) {
        result = await getFolder(this.client, params);
      } else {
        result = await getFile(this.client, params);
      }
      return sucessResponse(result);
    } catch (err: any) {
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
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async delete(params: DeleteFileParams | DeleteFolderParams) {
    try {
      await this.ensureClientIsOpen();
      let result;
      if (params.isDirectory) {
        result = await deleteFolder(this.client, params);
      } else {
        result = await deleteFile(this.client, params);
      }
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async rename(params: RenameParams) {
    try {
      await this.ensureClientIsOpen();
      const result = await rename(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async getSourceUrl(params: GetSourceUrlParams) {
    try {
      await this.ensureClientIsOpen();
      const result = await getSourceUrl(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }
}

export default SftpStore;
