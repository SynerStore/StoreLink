import COS from 'cos-nodejs-sdk-v5';

import { sucessResponse, errorResponse, isObjectFolder } from '@/main/utils';
import { IStorageHandler } from '../store';
import {
  list,
  ListParams,
  GetObjectParams,
  GetFolderParams,
  getFolder,
  getObject,
  GetMultiObjectsParams,
  getMultiObjects,
  PutMultiObjectsParams,
  putMultiObjects,
  DeleteObjectParams,
  deleteObject,
  DeleteMultiObjectsParams,
  deleteMultiObjects,
  deleteFolder,
  DeleteFolderParams,
  RenameObjectParams,
  renameFolder,
  RenameFolderParams,
  renameObject,
  CopyObjectParams,
  copyObject,
  ListAllObjectsParams,
  listAllObjects,
  putFolder,
  PutFolderParams,
  getSourceUrl,
  putObject,
  getService,
} from './api';
import { storeRemove } from '../../storeManage';

class CosStore implements IStorageHandler {
  public client: any;
  public config: any;
  public id: string;
  public bucketName: string;
  public region: string;

  constructor(id: string, config: any) {
    this.id = id;
    this.config = config;
    this.bucketName = config.bucketName;
    this.region = config.region;
    this.init(config);
  }

  init(config: any) {
    const { accessKeyId, secretAccessKey } = config;
    this.client = new COS({
      SecretId: accessKeyId,
      SecretKey: secretAccessKey,
    });
    try {
      this.config.secretAccessKey = undefined;
    } catch (_e) {}
  }

  // 销毁
  destroy() {
    storeRemove(this.id);
  }

  // 测试链接
  async test() {
    try {
      if (this.bucketName && this.region) {
        return new Promise<any>((resolve) => {
            this.client.headBucket({
                Bucket: this.bucketName,
                Region: this.region,
            }, (err: any, data: any) => {
                if (err) {
                    resolve(errorResponse(err.message));
                } else {
                    resolve(sucessResponse(true));
                }
            });
        });
      } else {
        const buckets = await getService(this.client);
        return sucessResponse(buckets);
      }
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  // 列表
  async list(params: ListParams) {
    try {
      const result = await list(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async listDir(params: ListParams) {
    try {
      const result = await list(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async getObject(params: GetObjectParams, onProgress?: any) {
    try {
      await getObject(this.client, { ...params, bucketName: this.bucketName, region: this.region }, onProgress);
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async getFolder(params: GetFolderParams) {
    try {
      await getFolder(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async getMultiObjects(params: GetMultiObjectsParams) {
    try {
      await getMultiObjects(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async putObject(params: any, onProgress?: any) {
    try {
      await putObject(this.client, { ...params, bucketName: this.bucketName, region: this.region }, onProgress);
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async putFolder(params: PutFolderParams) {
    try {
      await putFolder(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async putMultiObjects(params: PutMultiObjectsParams, onProgress?: any) {
    try {
      await putMultiObjects(this.client, { ...params, bucketName: this.bucketName, region: this.region }, onProgress);
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async deleteObject(params: DeleteObjectParams) {
    try {
      await deleteObject(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async deleteMultiObjects(params: DeleteMultiObjectsParams) {
    try {
      await deleteMultiObjects(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async deleteFolder(params: DeleteFolderParams) {
    try {
      await deleteFolder(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async renameObject(params: RenameObjectParams) {
    try {
      await renameObject(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async renameFolder(params: RenameFolderParams) {
    try {
      await renameFolder(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async copyObject(params: CopyObjectParams) {
    try {
      await copyObject(this.client, { ...params, bucketName: this.bucketName, region: this.region });
      return sucessResponse(true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async getSourceUrl(key: string) {
    try {
      const result = await getSourceUrl(this.client, this.bucketName, this.region, key);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }
}

export default CosStore;
