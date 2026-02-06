import fs from 'fs-extra';

import { sucessResponse, errorResponse } from '@/main/utils/response';
import { IStorageHandler } from '../store';
import {
  list,
  listDir,
  ListParams,
  deleteFile,
  deleteMultiFiles,
  DeleteFileParams,
  DeleteMultiFilesParams,
  rename,
  RenameParams,
  GetSourceUrlParams,
  putFolder,
  PutFolderParams,
  getSourceUrl,
  PutMultiObjectsParams,
  putMultiObjects,
  CopyFileParams,
  copyFile,
} from './api';

class LocalStore implements IStorageHandler {
  root: string;
  config: any;
  id: string;
  constructor(id: string, config: any) {
    this.id = id;
    this.config = config;
    this.root = config.root;
  }
  //   需要获取权限 如何通过系统询问访问
  async test() {
    try {
      await fs.promises.access(this.root, fs.constants.R_OK | fs.constants.W_OK);
      return sucessResponse(true);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  async list(params: ListParams) {
    try {
      let result = await list(this.root, params);
      // 隐藏文件
      if (this.config?.isShowHiddenFiles === false) {
        result = result.filter((item: any) => !item.isHiddenFile);
      }
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async listDir(params: ListParams) {
    try {
      let result = await listDir(this.root, params);
      // 隐藏文件
      if (this.config?.isShowHiddenFiles === false) {
        result = result.filter((item: any) => !item.isHiddenFile);
      }
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  // 删除
  async delete(params: DeleteFileParams) {
    try {
      const result = await deleteFile(params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  // 批量删除
  async deleteMulti(params: DeleteMultiFilesParams) {
    try {
      const result = await deleteMultiFiles(params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  async rename(params: RenameParams) {
    try {
      const result = await rename(params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  // 复制
  async copy(params: CopyFileParams) {
    try {
      const result = await copyFile(params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  // 上传对象·
  async put(params: PutMultiObjectsParams) {
    try {
      const result = await putMultiObjects(this.root, params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }
  async putFolder(params: PutFolderParams) {
    try {
      const result = await putFolder(this.root, params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  // 获取资源地址
  async getSourceUrl(params: GetSourceUrlParams) {
    try {
      const result = await getSourceUrl(params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }
}

export default LocalStore;
