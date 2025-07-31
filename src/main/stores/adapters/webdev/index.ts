import { createClient } from 'webdav';

import { sucessResponse, errorResponse, isObjectFolder } from '@/main/utils';
import { IStorageHandler } from '../store';
import {
  list,
  ListParams,
  deleteFile,
  DeleteFileParams,
  deleteMultiFiles,
  DeleteMultiFilesParams,
  rename,
  RenameParams,
  putMultiObjects,
  PutMultiObjectsParams,
  putFolder,
  PutFolderParams,
  // GetSourceUrlParams,
  // getSourceUrl,
  getFolder,
  GetFileParams,
  getFile,
  GetFolderParams,
} from './api';
import { storeRemove } from '../../storeManage';

class WebDAVStore implements IStorageHandler {
  public config: any;
  public client: any;
  public id: string;
  constructor(id: string, config: any) {
    this.id = id;
    this.config = config;

    this.init(this.config);
  }

  async init(config: any) {
    const { address, username, password } = config;
    this.client = createClient(address, { username, password });
  }

  //   需要获取权限 如何通过系统询问访问
  async test() {
    try {
      await this.client.getDirectoryContents('/');
      return sucessResponse(true);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  async list(params: ListParams) {
    try {
      const result = await list(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      console.log(err);
      return errorResponse(err.message);
    }
  }

  //  下载
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
    }
  }

  async put(params: PutMultiObjectsParams) {
    try {
      const result = await putMultiObjects(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async putFolder(params: PutFolderParams) {
    try {
      const result = await putFolder(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  // // 删除
  async delete(params: DeleteFileParams) {
    try {
      let result = await deleteFile(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  // 批量删除
  async deleteMulti(params: DeleteMultiFilesParams) {
    try {
      const result = await deleteMultiFiles(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  async rename(params: RenameParams) {
    try {
      const result = await rename(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  // // 获取资源地址
  // async getSourceUrl(params: GetSourceUrlParams) {
  //   try {
  //     const result = await getSourceUrl(this.client, params);
  //     return sucessResponse(result);
  //   } catch (err: any) {
  //     return errorResponse(err.message);
  //   }
  // }
}

export default WebDAVStore;
