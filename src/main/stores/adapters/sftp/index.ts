import SftpClient from 'ssh2-sftp-client';

import { sucessResponse, errorResponse } from '@/main/utils/response';
import { isObjectFolder } from '@/main/utils/fs';
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
    const { host, port, username, password, privateKey, passphrase } = config;

    // 清理旧的监听器，防止重复绑定
    this.client.removeListener('end', () => {});
    this.client.removeListener('close', () => {});
    this.client.removeListener('error', () => {});

    // 尝试断开旧连接（如果存在）
    try {
      await this.client.end();
    } catch (e) {
      // 忽略断开连接时的错误
    }

    // 创建新的 Client 实例，确保状态干净
    this.client = new SftpClient();

    try {
      await this.client.connect({
        host,
        port,
        username,
        password,
        privateKey,
        passphrase,
        keepaliveInterval: 15000,
        readyTimeout: 20000, // 增加超时时间
      } as any);
      
      this.connected = true;
      
      // 清除内存中的明文密码
      try {
        this.config.password = undefined;
        this.config.passphrase = undefined;
      } catch (_e) {}

      // 重新绑定监听器
      this.client.on('end', () => {
        this.connected = false;
        console.log('Connection ended unexpectedly');
      });
      this.client.on('close', () => {
        this.connected = false;
        console.log('Connection closed');
      });
      this.client.on('error', (err: any) => {
        // 只有在非 ECONNRESET 错误时才打印详细错误
        if (err.code !== 'ECONNRESET') {
          console.error('SFTP 客户端错误:', err.message);
        } else {
          console.warn('SFTP 连接被重置 (ECONNRESET)，将在下次操作时自动重连');
        }
        this.connected = false;
      });

    } catch (err: any) {
      this.connected = false;
      console.error('SFTP 连接失败:', err.message);
      throw err; // 必须抛出错误，让上层知道连接失败
    }
  }

  destroy() {
    this.client.end();
  }

  private async ensureClientIsOpen() {
    if (this.connected) return;
    try {
      await this.init(this.config);
    } catch (e) {
      // init 中已经打印了错误，这里重新抛出以便 execute 捕获
      throw e;
    }
  }

  private async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.ensureClientIsOpen();
      return await operation();
    } catch (err: any) {
      // Handle connection errors and retry once
      if (
        err.message.includes('No SFTP connection available') ||
        err.message.includes('Client not connected') ||
        err.code === 'ECONNRESET' ||
        err.code === 'ENOTFOUND'
      ) {
        console.warn('SFTP connection lost, retrying...', err.message);
        this.connected = false;
        await this.ensureClientIsOpen();
        return await operation();
      }
      throw err;
    }
  }

  async test() {
    try {
      await this.execute(() => this.client.list('/'));
      return sucessResponse(true);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  async list(params: ListParams) {
    try {
      const result = await this.execute(() => list(this.client, params));
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async listDir(params: ListParams) {
    try {
      const result = await this.execute(async () => {
        const res = await list(this.client, params);
        return res.filter((item: any) => item.isDirectory);
      });
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async get(params: GetFolderParams & GetFileParams) {
    try {
      const result = await this.execute(() => {
        if (isObjectFolder(params.key)) {
          return getFolder(this.client, params);
        } else {
          return getFile(this.client, params);
        }
      });
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async put(params: PutFileParams) {
    try {
      const result = await this.execute(() => putFile(this.client, params));
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async putFolder(params: PutFolderParams) {
    try {
      const result = await this.execute(() => putFolder(this.client, params));
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async delete(params: DeleteFileParams | DeleteFolderParams) {
    try {
      const result = await this.execute(() => {
        if (params.isDirectory) {
          return deleteFolder(this.client, params);
        } else {
          return deleteFile(this.client, params);
        }
      });
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async rename(params: RenameParams) {
    try {
      const result = await this.execute(() => rename(this.client, params));
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async getSourceUrl(params: GetSourceUrlParams) {
    try {
      const result = await this.execute(() => getSourceUrl(this.client, params));
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }
}

export default SftpStore;
