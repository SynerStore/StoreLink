import OSS from 'ali-oss';
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

export const formatObjects = (objects: OSS.ObjectMeta[]): TStoreObject[] => {
  return objects
    .filter((object: OSS.ObjectMeta) => !object.name.endsWith('/')) // 过滤掉空文件夹
    .map((obj: any) => {
      const { name, url, lastModified, etag, size, storageClass } = obj;
      const baseName = path.basename(name);
      return {
        key: name,
        name: baseName,
        url: url,
        lastModified: lastModified,
        size: size,
        etag: etag,
        storageClass: storageClass,
        isDirectory: false, // 判断是否是文件夹
        mime: mime.lookup(name),
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
};
export async function list(
  client: OSS,
  params: {
    prefix: string;
    nextContinuationToken?: string;
    maxKeys?: number;
  },
) {
  const { prefix, nextContinuationToken } = params;
  let allObjects: TStoreObject[] = [];

  const response = await client.listV2(
    {
      'max-keys': '1000',
      prefix: prefix,
      delimiter: '/',
      'continuation-token': nextContinuationToken,
    },
    {},
  );
  if (response.prefixes?.length) {
    allObjects = allObjects.concat(formatPrefixs(response.prefixes));
  }
  if (response.objects?.length) {
    allObjects = allObjects.concat(formatObjects(response.objects));
  }

  return {
    objects: allObjects,
    total: allObjects.length,
    // @ts-ignore
    nextContinuationToken: response.nextContinuationToken,
  };
}

// 下载对象

// 下载对象
export type GetObjectParams = {
  key: string;
  localPath?: string;
  localFilePath?: string;
};
export async function getObject(client: OSS, params: GetObjectParams, onProgress?: any) {
  const { key, localPath, localFilePath } = params;
  // 假如传入了文件路径，则直接下载到指定路径
  const targetFilePath = localFilePath || path.join(localPath as string, path.basename(key));
  //   @ts-ignore
  const meta = await client.getObjectMeta(key);
  const size = meta.res.headers['content-length'];
  const result = await client.getStream(key);
  const readerStream = result.stream;
  const writerStream = fs.createWriteStream(targetFilePath);
  streamOnProgress(readerStream, writerStream, size, onProgress);
  readerStream.pipe(writerStream);
}

// 获取桶内的全部对象
export type ListAllObjectsParams = {
  prefix: string;
};
export async function listAllObjects(client: OSS, params: ListAllObjectsParams) {
  const { prefix } = params;
  let continuationToken = undefined;
  const allKeys: Set<string> = new Set([prefix]);
  let totalSize = 0;

  do {
    const response = await client.listV2(
      {
        prefix,
        delimiter: '/', // 分隔符（可选）
        'continuation-token': continuationToken,
        'max-keys': '1000',
      },
      {},
    );

    if (response.prefixes?.length) {
      for (const prefix of response.prefixes) {
        allKeys.add(prefix);
      }
    }
    if (response.objects?.length) {
      response.objects.forEach((obj: any) => {
        totalSize += obj.size;
        allKeys.add(obj.name);
      });
    }
    // @ts-ignore
    continuationToken = response.nextContinuationToken;
  } while (continuationToken);

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
};
export async function getMultiObjects(client: OSS, params: GetMultiObjectsParams) {
  const { prefix, keys, localPath } = params;
  const allKeys = [];

  for (const key of keys) {
    if (isObjectFolder(key)) {
      const { keys: allPrefixKeys } = await listAllObjects(client, { prefix: key });
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
      await getObject(client, { key, localFilePath });
    }
  }
}

// 下载目录
export type GetFolderParams = {
  prefix: string;
  key: string;
  localPath: string;
};
export async function getFolder(client: OSS, params: GetFolderParams) {
  const { prefix, key, localPath } = params;
  return await getMultiObjects(client, { prefix, keys: [key], localPath });
}

export type UploadObjectParams = {
  prefix?: string;
  key?: string;
  localPath: string;
};

export async function uploadObject(client: OSS, params: UploadObjectParams) {
  const { key, localPath } = params;
  const result = await client.put(key as string, fs.createReadStream(localPath));
  return result;
}

export type PutObjectParams = {
  prefix?: string;
  key?: string;
  localPath: string;
};
export async function putObject(client: OSS, params: PutObjectParams) {
  const { prefix, key, localPath } = params;
  const objectKey = key || path.join(prefix as string, path.basename(localPath));

  if (await isDirectory(localPath)) {
    return await putFolder(client, { prefix: prefix as string, localPath });
  } else {
    return await uploadObject(client, { key: objectKey, localPath });
  }
}

export async function createFolder(client: OSS, prefix: string) {
  const result = await client.put(prefix, Buffer.from(''));
  return result;
}

export type PutFolderParams = {
  prefix: string;
  localPath: string;
};
export async function putFolder(client: OSS, params: PutFolderParams) {
  const { prefix, localPath } = params;
  const key = path.join(prefix, path.basename(localPath), '/');
  const result = await createFolder(client, key);
  return result;
}

// 多选上传对象
export type PutMultiObjectsParams = {
  prefix: string;
  localPaths: string[];
};
export async function putMultiObjects(client: OSS, params: PutMultiObjectsParams) {
  const { prefix, localPaths } = params;
  const allLocalPaths = await readDirectoryRecursive(localPaths);

  for (const localPath of allLocalPaths) {
    const filePath = localPath.fullPath;
    const remotePath = path.join(prefix, localPath.path);

    await putObject(client, {
      key: remotePath,
      prefix: prefix,
      localPath: filePath,
    });
  }
}

// 删除桶内的全部对象
export type DeleteFolderParams = {
  key: string;
};
export async function deleteFolder(client: OSS, params: DeleteFolderParams) {
  const { key: prefix } = params; // key as prefix
  const { keys } = await listAllObjects(client, { prefix });
  for (const key of keys) {
    await deleteObject(client, { key });
  }
  return;
}

// 删除对象
export type DeleteObjectParams = {
  key: string;
};
export async function deleteObject(client: OSS, params: DeleteObjectParams) {
  const { key } = params;
  const result = await client.delete(key);
  return result;
}

// 删除多个对象
export type DeleteMultiObjectsParams = {
  keys: string[];
};
export async function deleteMultiObjects(client: OSS, params: DeleteMultiObjectsParams) {
  const { keys } = params;
  for (const key of keys) {
    if (isObjectFolder(key)) {
      await deleteFolder(client, { key });
    } else {
      await deleteObject(client, { key });
    }
  }
}

async function isExistObject(client: OSS, key: string, options = {}) {
  try {
    await client.head(key, options);
    return true;
  } catch (error) {
    return false;
  }
}

// 重命名
export type RenameObjectParams = {
  oldKey: string;
  newKey: string;
  prefix?: string;
};
export async function renameObject(client: OSS, params: RenameObjectParams) {
  const { oldKey, newKey, prefix = '' } = params;
  const remotePath = path.join(prefix, newKey);
  if (isObjectFolder(remotePath)) {
    if (!(await isExistObject(client, remotePath))) {
      await createFolder(client, remotePath);
    }
  } else {
    await client.copy(remotePath, oldKey);
  }
  await deleteObject(client, { key: oldKey });
}

// 重命名目录
export type RenameFolderParams = {
  oldKey: string;
  newKey: string;
};
export async function renameFolder(client: OSS, params: RenameFolderParams) {
  const { oldKey, newKey } = params;
  const newKeyPrefix = path.join(path.dirname(oldKey), newKey, '/'); // 计算新 prefix
  const { keys } = await listAllObjects(client, { prefix: oldKey });
  for (const key of keys) {
    const objectNewKey = key.replace(oldKey, newKeyPrefix);
    await renameObject(client, { oldKey: key, newKey: objectNewKey });
  }
}

// 获取资源地址
export type GetSourceUrlParams = {
  key: string;
};
export async function getSourceUrl(client: OSS, params: GetSourceUrlParams) {
  const { key } = params;
  //   @ts-ignore
  const meta = await client.getObjectMeta(key);
  const etag = meta.res.headers['etag'].replaceAll('"', '');
  // 基于 etag 生成临时文件名
  const tmpFileName = path.join(getTempPath(), `${etag}${path.extname(key)}`);
  const filePath = `file://${tmpFileName}`;
  if (!fs.existsSync(tmpFileName)) {
    const readerStream = (await client.getStream(key)).stream;
    const writerStream = fs.createWriteStream(tmpFileName);
    await streamToPromise(readerStream, writerStream);
  }
  const mimeValue = mime.lookup(filePath) || '';
  let content = '';
  if (/text\/.{0,}/.test(mimeValue)) {
    content = await fs.readFile(tmpFileName, { encoding: 'utf-8' });
  }
  return {
    src: filePath,
    mime: mimeValue,
    content: content,
  };
}
