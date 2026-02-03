import COS from 'cos-nodejs-sdk-v5';
import path from 'node:path';
import mime from 'mime-types';
import fs from 'fs-extra';
import { Buffer } from 'node:buffer';

import {
  isDirectory,
  isObjectFolder,
  readDirectoryRecursive,
  streamOnProgress,
  getTempPath,
  streamToPromise,
} from '@/main/utils';
import { TStoreObject } from '@/types';

export const formatObjects = (objects: any[], bucketName: string, region: string): TStoreObject[] => {
  return objects
    .filter((object: any) => !object.Key.endsWith('/')) // 过滤掉空文件夹
    .map((obj: any) => {
      const { Key, LastModified, ETag, Size, StorageClass } = obj;
      const baseName = path.basename(Key);
      // COS URL format: https://<BucketName>.cos.<Region>.myqcloud.com/<Key>
      const url = `https://${bucketName}.cos.${region}.myqcloud.com/${Key}`;
      return {
        key: Key,
        name: baseName,
        url: url,
        lastModified: LastModified,
        size: parseInt(Size),
        etag: ETag,
        storageClass: StorageClass,
        isDirectory: false,
        mime: mime.lookup(Key),
      };
    });
};

export const formatPrefixs = (prefixs: string[]): TStoreObject[] => {
  return prefixs.map((prefix) => {
    const name = path.basename(prefix as string);
    return {
      key: prefix,
      name: name,
      lastModified: undefined,
      size: 0,
      etag: '',
      storageClass: '',
      isDirectory: true,
      mime: undefined,
    };
  });
};

export type ListParams = {
  prefix: string;
  nextContinuationToken?: string;
  maxKeys?: number;
  bucketName: string;
  region: string;
};

export async function list(
  client: COS,
  params: ListParams
) {
  const { prefix, nextContinuationToken, bucketName, region, maxKeys = 1000 } = params;

  return new Promise<{
    objects: TStoreObject[];
    total: number;
    nextContinuationToken?: string;
  }>((resolve, reject) => {
    client.getBucket({
      Bucket: bucketName,
      Region: region,
      Prefix: prefix,
      Delimiter: '/',
      Marker: nextContinuationToken,
      MaxKeys: maxKeys,
    }, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      let allObjects: TStoreObject[] = [];

      if (data.CommonPrefixes && data.CommonPrefixes.length > 0) {
         const prefixes = data.CommonPrefixes.map(item => item.Prefix);
         allObjects = allObjects.concat(formatPrefixs(prefixes));
      }

      if (data.Contents && data.Contents.length > 0) {
        allObjects = allObjects.concat(formatObjects(data.Contents, bucketName, region));
      }

      resolve({
        objects: allObjects,
        total: allObjects.length,
        nextContinuationToken: data.IsTruncated === 'true' ? data.NextMarker : undefined,
      });
    });
  });
}

// 获取服务列表（列出所有 Bucket）
export async function getService(client: COS) {
  return new Promise<any[]>((resolve, reject) => {
    client.getService((err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // Map to expected format if needed, or just return raw data
      // OSS adapter returns object with .buckets property
      // We should probably return a list of buckets with name and region
      const buckets = data.Buckets.map((item: any) => ({
          name: item.Name,
          region: item.Location,
          creationDate: item.CreationDate
      }));
      resolve(buckets);
    });
  });
}

// 下载对象
export type GetObjectParams = {
  key: string;
  localPath?: string;
  localFilePath?: string;
  bucketName: string;
  region: string;
};

export async function getObject(client: COS, params: GetObjectParams, onProgress?: any) {
  const { key, localPath, localFilePath, bucketName, region } = params;
  const targetFilePath = localFilePath || path.join(localPath as string, path.basename(key));

  return new Promise<void>((resolve, reject) => {
      // Get object to stream/file
      client.getObject({
          Bucket: bucketName,
          Region: region,
          Key: key,
          Output: fs.createWriteStream(targetFilePath),
          onProgress: (progressData) => {
              if (onProgress) {
                  onProgress({
                      progress: progressData.percent * 100,
                      status: 'running',
                  });
              }
          }
      }, (err, data) => {
          if (err) {
              reject(err);
          } else {
              if (onProgress) {
                  onProgress({ progress: 100, status: 'finished' });
              }
              resolve();
          }
      });
  });
}

// 获取桶内的全部对象
export type ListAllObjectsParams = {
  prefix: string;
  bucketName: string;
  region: string;
};

export async function listAllObjects(client: COS, params: ListAllObjectsParams) {
  const { prefix, bucketName, region } = params;
  let marker: string | undefined = undefined;
  const allKeys: Set<string> = new Set([prefix]);
  let totalSize = 0;

  do {
      const data: any = await new Promise((resolve, reject) => {
          client.getBucket({
              Bucket: bucketName,
              Region: region,
              Prefix: prefix,
              Delimiter: '/',
              Marker: marker,
              MaxKeys: 1000,
          }, (err, data) => {
              if (err) reject(err);
              else resolve(data);
          });
      });

      if (data.CommonPrefixes && data.CommonPrefixes.length > 0) {
          data.CommonPrefixes.forEach((item: any) => {
              allKeys.add(item.Prefix);
          });
      }

      if (data.Contents && data.Contents.length > 0) {
          data.Contents.forEach((obj: any) => {
              totalSize += parseInt(obj.Size);
              allKeys.add(obj.Key);
          });
      }

      marker = data.IsTruncated === 'true' ? data.NextMarker : undefined;

  } while (marker);

  return {
    keys: Array.from(allKeys),
    total: allKeys.size,
    size: totalSize,
  };
}

// 多选下载对象
export type GetMultiObjectsParams = {
  prefix: string;
  keys: string[];
  localPath: string;
  bucketName: string;
  region: string;
};

export async function getMultiObjects(client: COS, params: GetMultiObjectsParams) {
  const { prefix, keys, localPath, bucketName, region } = params;
  const allKeys = [];

  for (const key of keys) {
    if (isObjectFolder(key)) {
      const { keys: allPrefixKeys } = await listAllObjects(client, { prefix: key, bucketName, region });
      allKeys.push(...allPrefixKeys);
    } else {
      allKeys.push(key);
    }
  }

  for (const key of allKeys) {
    const realtivePath = key.replace(prefix, '');
    const localFilePath = path.join(localPath, realtivePath);
    if (isObjectFolder(key)) {
      await fs.ensureDir(localFilePath);
    } else {
      await getObject(client, { key, localFilePath, bucketName, region });
    }
  }
}

// 下载目录
export type GetFolderParams = {
  prefix: string;
  key: string;
  localPath: string;
  bucketName: string;
  region: string;
};
export async function getFolder(client: COS, params: GetFolderParams) {
  const { prefix, key, localPath, bucketName, region } = params;
  return await getMultiObjects(client, { prefix, keys: [key], localPath, bucketName, region });
}

export type UploadObjectParams = {
  prefix?: string;
  key?: string;
  localPath: string;
  bucketName: string;
  region: string;
};

// Internal use for single file upload logic if needed, but putObject below handles both
async function uploadObject(client: COS, params: UploadObjectParams, onProgress?: any) {
   // This is effectively putObject logic, keeping for structure consistency
   return putObject(client, params, onProgress);
}

export type PutObjectParams = {
  prefix?: string;
  key?: string;
  localPath?: string;
  filePath?: string; // specific for cos sdk convenience
  buffer?: Buffer; // specific for cos sdk convenience
  bucketName: string;
  region: string;
};

export async function putObject(client: COS, params: PutObjectParams, onProgress?: any) {
  const { prefix, key: paramKey, localPath, filePath, buffer, bucketName, region } = params;

  // Determine key
  let key = paramKey;
  if (!key && prefix && localPath) {
      key = path.join(prefix, path.basename(localPath));
  }

  if (!key) throw new Error("Key or Prefix+LocalPath is required");

  // If directory
  if (localPath && await isDirectory(localPath)) {
    return await putFolder(client, { prefix: prefix as string, localPath, bucketName, region });
  }

  let body: any = buffer;
  if (localPath || filePath) {
      body = fs.createReadStream(localPath || filePath!);
  }

  return new Promise((resolve, reject) => {
    client.putObject({
      Bucket: bucketName,
      Region: region,
      Key: key!,
      Body: body,
      onProgress: (progressData) => {
         if (onProgress) {
            onProgress({
                 progress: progressData.percent * 100,
                 status: 'running'
             });
         }
      }
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (onProgress) {
            onProgress({ progress: 100, status: 'finished' });
        }
        resolve(data);
      }
    });
  });
}

export async function createFolder(client: COS, prefix: string, bucketName: string, region: string) {
  return new Promise((resolve, reject) => {
      client.putObject({
          Bucket: bucketName,
          Region: region,
          Key: prefix,
          Body: Buffer.from(''),
      }, (err, data) => {
          if (err) reject(err);
          else resolve(data);
      });
  });
}

export type PutFolderParams = {
  prefix: string;
  localPath: string;
  bucketName: string;
  region: string;
};

export async function putFolder(client: COS, params: PutFolderParams) {
  const { prefix, localPath, bucketName, region } = params;
  const key = path.join(prefix, path.basename(localPath), '/');
  const result = await createFolder(client, key, bucketName, region);
  return result;
}

// 多选上传对象
export type PutMultiObjectsParams = {
  prefix: string;
  localPaths: string[];
  bucketName: string;
  region: string;
};

export async function putMultiObjects(client: COS, params: PutMultiObjectsParams, onProgress?: any) {
  const { prefix, localPaths, bucketName, region } = params;
  const allLocalPaths = await readDirectoryRecursive(localPaths);

  // Calculate total size
  let totalSize = 0;
  const filesToUpload = [];

  for (const item of allLocalPaths) {
    if (await isDirectory(item.fullPath)) {
      filesToUpload.push({ ...item, isDir: true, size: 0 });
    } else {
      const stat = await fs.stat(item.fullPath);
      totalSize += stat.size;
      filesToUpload.push({ ...item, isDir: false, size: stat.size });
    }
  }

  let uploadedBytes = 0;

  for (const item of filesToUpload) {
    const filePath = item.fullPath;
    const remotePath = path.join(prefix, item.path);

    await putObject(
      client,
      {
        key: remotePath,
        prefix: prefix,
        localPath: filePath,
        bucketName,
        region
      },
      (progressData: any) => {
        if (onProgress && totalSize > 0 && !item.isDir) {
          const filePercent = progressData.progress || 0;
          const currentFileLoaded = (filePercent / 100) * item.size;
          const totalLoaded = uploadedBytes + currentFileLoaded;
          const totalPercent = (totalLoaded / totalSize) * 100;
          onProgress({
            progress: totalPercent,
            status: 'running',
          });
        }
      },
    );

    if (!item.isDir) {
      uploadedBytes += item.size;
    }
  }
}

// 删除桶内的全部对象
export type DeleteFolderParams = {
  key: string;
  bucketName: string;
  region: string;
};
export async function deleteFolder(client: COS, params: DeleteFolderParams) {
  const { key: prefix, bucketName, region } = params; // key as prefix
  const { keys } = await listAllObjects(client, { prefix, bucketName, region });
  for (const key of keys) {
    await deleteObject(client, { key, bucketName, region });
  }
  return;
}

// 删除对象
export type DeleteObjectParams = {
  key: string;
  bucketName: string;
  region: string;
};
export async function deleteObject(client: COS, params: DeleteObjectParams) {
  const { key, bucketName, region } = params;
  return new Promise((resolve, reject) => {
      client.deleteObject({
          Bucket: bucketName,
          Region: region,
          Key: key
      }, (err, data) => {
          if (err) reject(err);
          else resolve(data);
      });
  });
}

// 删除多个对象
export type DeleteMultiObjectsParams = {
  keys: string[];
  bucketName: string;
  region: string;
};
export async function deleteMultiObjects(client: COS, params: DeleteMultiObjectsParams) {
  const { keys, bucketName, region } = params;
  for (const key of keys) {
    if (isObjectFolder(key)) {
      await deleteFolder(client, { key, bucketName, region });
    } else {
      await deleteObject(client, { key, bucketName, region });
    }
  }
}

// 复制对象
export type CopyObjectParams = {
  sourceKey: string;
  targetKey: string;
  bucketName: string;
  region: string;
};
export async function copyObject(client: COS, params: CopyObjectParams) {
  const { sourceKey, targetKey, bucketName, region } = params;
  return new Promise((resolve, reject) => {
      // COS copy source format: <BucketName-APPID>.cos.<Region>.myqcloud.com/<Key>
      // We need to construct this.
      // Assuming source is in same bucket/region as per OSS implementation usually implies.
      // But we can get Bucket/Region from client config or params.
      // Ideally source string should be: `test-1250000000.cos.ap-guangzhou.myqcloud.com/test.jpg`
      const copySource = `${bucketName}.cos.${region}.myqcloud.com/${encodeURIComponent(sourceKey).replace(/%2F/g, '/')}`;

      client.putObjectCopy({
          Bucket: bucketName,
          Region: region,
          Key: targetKey,
          CopySource: copySource,
      }, (err, data) => {
          if (err) reject(err);
          else resolve(data);
      });
  });
}

async function isExistObject(client: COS, key: string, bucketName: string, region: string) {
  try {
    return await new Promise((resolve, reject) => {
        client.headObject({
            Bucket: bucketName,
            Region: region,
            Key: key
        }, (err, data) => {
            if (err) reject(err);
            else resolve(true);
        });
    });
  } catch (error) {
    return false;
  }
}

// 重命名
export type RenameObjectParams = {
  oldKey: string;
  newKey: string;
  prefix?: string;
  bucketName: string;
  region: string;
};
export async function renameObject(client: COS, params: RenameObjectParams) {
  const { oldKey, newKey, prefix = '', bucketName, region } = params;
  const remotePath = path.join(prefix, newKey);
  if (isObjectFolder(remotePath)) {
    if (!(await isExistObject(client, remotePath, bucketName, region))) {
      await createFolder(client, remotePath, bucketName, region);
    }
  } else {
    await copyObject(client, { sourceKey: oldKey, targetKey: remotePath, bucketName, region });
  }
  await deleteObject(client, { key: oldKey, bucketName, region });
}

// 重命名目录
export type RenameFolderParams = {
  oldKey: string;
  newKey: string;
  bucketName: string;
  region: string;
};
export async function renameFolder(client: COS, params: RenameFolderParams) {
  const { oldKey, newKey, bucketName, region } = params;
  const newKeyPrefix = path.join(path.dirname(oldKey), newKey, '/'); // 计算新 prefix
  const { keys } = await listAllObjects(client, { prefix: oldKey, bucketName, region });
  for (const key of keys) {
    const objectNewKey = key.replace(oldKey, newKeyPrefix);
    await renameObject(client, { oldKey: key, newKey: objectNewKey, bucketName, region });
  }
}

// 获取资源地址
export type GetSourceUrlParams = {
  key: string;
};
export async function getSourceUrl(client: COS, bucketName: string, region: string, key: string) {
  // Use getObjectUrl to get signed URL
  return new Promise<any>((resolve, reject) => {
      client.getObjectUrl({
          Bucket: bucketName,
          Region: region,
          Key: key,
          Sign: true,
      }, async (err, data) => {
          if (err) {
              reject(err);
              return;
          }
          const url = data.Url;

          // Determine mime type
          // If we want to read content like OSS adapter does for text files:
          // We can download to temp like OSS adapter

          const meta: any = await new Promise((res, rej) => {
             client.headObject({Bucket: bucketName, Region: region, Key: key}, (e, d) => e?rej(e):res(d));
          });

          const etag = meta.ETag ? meta.ETag.replaceAll('"', '') : '';
          const tmpFileName = path.join(getTempPath(), `${etag}${path.extname(key)}`);
          const filePath = `file://${tmpFileName}`;

          if (!fs.existsSync(tmpFileName)) {
             // Download to temp
             await new Promise<void>((res, rej) => {
                client.getObject({
                    Bucket: bucketName,
                    Region: region,
                    Key: key,
                    Output: fs.createWriteStream(tmpFileName)
                }, (e) => e ? rej(e) : res());
             });
          }

          const mimeValue = mime.lookup(tmpFileName) || '';
          let content = '';
          if (/text\/.{0,}/.test(mimeValue)) {
            content = await fs.readFile(tmpFileName, { encoding: 'utf-8' });
          }

          resolve({
              src: filePath,
              mime: mimeValue,
              content: content
          });
      });
  });
}
