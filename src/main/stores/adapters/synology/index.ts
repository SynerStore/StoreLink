import { sucessResponse, errorResponse } from '@/main/utils/response';
import { isObjectFolder } from '@/main/utils/fs';
import SynologyApi from '@fett/synology-api';
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
  GetSourceUrlParams,
  getSourceUrl,
  getFolder,
  GetFileParams,
  getFile,
  GetFolderParams,
} from './api';

class SynologyStore implements IStorageHandler {
  public config: any;
  public id: string;
  public dsm: any;

  constructor(id: string, config: any) {
    this.id = id;
    this.config = config;
    this.init(this.config);
  }

  async init(config: any) {
    const { address, username, password, quickConnectServerType } = config;
    try {
      this.dsm = new SynologyApi({
        server: address,
        username,
        password,
        quickConnectServerType,
      });
    } catch (_e) {
      this.dsm = null;
    }
    try {
      this.config.password = undefined;
    } catch (_e) {}
  }

  async test() {
    try {
      if (!this.dsm?.FileStation?.getInfo) {
        return errorResponse('synology_api_missing');
      }
      await this.dsm.FileStation.getInfo();
      return sucessResponse(true);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  async list(params: ListParams) {
    try {
      const result = await list(this.dsm, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async listDir(params: ListParams) {
    try {
      const result = await list(this.dsm, params);
      const folders = result.filter((item: any) => item.isDirectory);
      return sucessResponse(folders);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async get(params: GetFolderParams & GetFileParams) {
    try {
      let result;
      if (isObjectFolder(params.key)) {
        result = await getFolder(this.dsm, params);
      } else {
        result = await getFile(this.dsm, params);
      }
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async put(params: PutMultiObjectsParams) {
    try {
      const result = await putMultiObjects(this.dsm, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async putFolder(params: PutFolderParams) {
    try {
      const result = await putFolder(this.dsm, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async delete(params: DeleteFileParams) {
    try {
      const result = await deleteFile(this.dsm, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async deleteMulti(params: DeleteMultiFilesParams) {
    try {
      const result = await deleteMultiFiles(this.dsm, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async rename(params: RenameParams) {
    try {
      const result = await rename(this.dsm, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async getSourceUrl(params: GetSourceUrlParams) {
    try {
      const result = await getSourceUrl(this.dsm, this.config, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }
}

export default SynologyStore;
