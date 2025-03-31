import fs from 'fs-extra';

import { sucessResponse, errorResponse } from '@/main/utils';
import { IStorageHandler } from '../store';
import {
  list,
  ListParams,
  deleteFile,
  deleteMultiFiles,
  DeleteFileParams,
  DeleteMultiFilesParams,
  rename,
  RenameParams,
} from './api';

class LocalStore implements IStorageHandler {
  root: string;
  config: any;
  constructor(config: any) {
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
      const result = await list(this.root, params);
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
}

export default LocalStore;
