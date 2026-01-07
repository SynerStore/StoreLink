import OSS from 'ali-oss';

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
  PutFolderParams,
  putFolder,
  getSourceUrl,
  GetSourceUrlParams,
} from './api';
import { storeRemove } from '../../storeManage';

class OssStore implements IStorageHandler {
  public client: any;
  public config: any;
  public id: string;
  constructor(id: string, config: any) {
    this.id = id;
    this.config = config;
    this.init(config);
  }

  init(config: any) {
    const { accessKeyId, secretAccessKey, bucketName } = config;
    this.client = new OSS({
      accessKeyId: accessKeyId, // 推荐使用环境变量获取；用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
      accessKeySecret: secretAccessKey,
      bucket: bucketName,
      secure: true,
    });
    try {
      this.config.secretAccessKey = undefined;
      this.config.accessKeySecret = undefined;
    } catch (_e) {}
  }

  // 销毁
  destroy() {
    storeRemove(this.id);
  }

  // 测试链接
  async test() {
    try {
      let result;
      if (this.config.bucketName) {
        await this.client.listV2({ 'max-keys': 1 });
      } else {
        result = await this.client.listBuckets();
      }
      return sucessResponse(result?.buckets || true);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  // 列表
  async list(params: ListParams) {
    try {
      const result = await list(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }

  // 下载单个对象
  async get(params: GetObjectParams & GetFolderParams, onProgress?: any) {
    try {
      let result;
      if (isObjectFolder(params.key)) {
        result = await getFolder(this.client, params);
      } else {
        result = await getObject(this.client, params, onProgress);
      }
      return sucessResponse(result);
    } catch (err: any) {
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
  async put(params: PutMultiObjectsParams, onProgress?: any) {
    try {
      const result = await putMultiObjects(this.client, params, onProgress);
      return sucessResponse(result);
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message);
    }
  }

// 创建文件夹
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

  // 复制
  async copy(params: CopyObjectParams) {
    try {
      const result = await copyObject(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
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

  // 获取资源地址
  async getSourceUrl(params: GetSourceUrlParams) {
    try {
      const result = await getSourceUrl(this.client, params);
      return sucessResponse(result);
    } catch (err: any) {
      return errorResponse(err.message);
    }
  }
}

export default OssStore;
