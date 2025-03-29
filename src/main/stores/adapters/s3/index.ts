import * as S3 from '@aws-sdk/client-s3';

import { sucessResponse, errorResponse, isObjectFolder } from '@/main/utils';
import {
  list,
  ListParams,
  getObject,
  putFolder,
  PutFolderParams,
  GetObjectParams,
  GetFolderParams,
  getFolder,
  getMultiObjects,
  GetMultiObjectsParams,
  PutMultiObjectsParams,
  putMultiObjects,
  DeleteObjectParams,
  deleteObject,
  deleteMultiObjects,
  DeleteFolderParams,
  deleteFolder,
  DeleteMultiObjectsParams,
  RenameFolderParams,
  renameFolder,
  RenameObjectParams,
  renameObject,
  ListAllObjectsParams,
  listAllObjects,
} from './api';
import { IStorageHandler } from '../store';

class S3Store implements IStorageHandler {
  public client: any;
  public config: any;
  constructor(config: any) {
    this.init(config);
  }

  init(config: any) {
    const { region, endpoint, accessKeyId, secretAccessKey } = config;
    this.config = config;
    this.client = new S3.S3Client({
      region: region,
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
    // 中间件
    this.client.middlewareStack.add(
      (next: any) => (args: any) => {
        // 添加中间件
        // console.log('Request Headers:', args.request.headers);
        return next(args);
      },
      { step: 'build' },
    );
  }

  async test() {
    try {
      // 列举当前账号所有地域下的存储空间。
      const command = new S3.ListBucketsCommand({});
      const result = await this.client.send(command);
      return sucessResponse(result.Buckets);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  async list(params: ListParams) {
    try {
      const result = await list(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      debugger
      return errorResponse(err.message);
    }
  }

  // 下载单个对象
  async get(params: GetObjectParams & GetFolderParams) {
    try {
      let result;
      if (isObjectFolder(params.key)) {
        result = await getFolder(this.client, params);
      } else {
        result = await getObject(this.client, params);
      }
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  // 多选下载
  async getMulti(params: GetMultiObjectsParams) {
    try {
      const result = await getMultiObjects(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  // 上传对象·
  async put(params: PutMultiObjectsParams) {
    try {
      const result = await putMultiObjects(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  // 多选上传对象
  async putFolder(params: PutFolderParams) {
    try {
      const result = await putFolder(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  // 删除
  async delete(params: DeleteObjectParams & DeleteFolderParams) {
    try {
      let result;
      if (isObjectFolder(params.key)) {
        result = await deleteFolder(this.client, params);
      } else {
        result = await deleteObject(this.client, params);
      }
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  // 删除多选对象
  async deleteMulti(params: DeleteMultiObjectsParams) {
    try {
      const result = await deleteMultiObjects(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  // 重命名
  async rename(params: RenameObjectParams & RenameFolderParams) {
    try {
      let result;
      if (isObjectFolder(params.oldKey)) {
        result = await renameFolder(this.client, params);
      } else {
        result = await renameObject(this.client, params);
      }
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

  // 统计存储桶
  async statistic(params: ListAllObjectsParams) {
    try {
      const result = await listAllObjects(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }
}

export default S3Store;
