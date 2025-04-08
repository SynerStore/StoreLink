// docs ：https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
import * as S3 from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import path from 'node:path';
import mime from 'mime-types';
import fs from 'fs-extra';
import { Buffer } from 'node:buffer';

import { isDirectory, isObjectFolder, readDirectoryRecursive, getTempPath, streamToPromise } from '@/main/utils';
import { TStoreObject } from '@/types';

export const formatObjects = (objects: S3._Object[], prefix: string): TStoreObject[] => {
  return objects
    .filter((obj: S3._Object) => obj.Key !== prefix)
    .map((obj: S3._Object) => {
      const { Key, LastModified, Size, ETag, StorageClass } = obj;
      const name = path.basename(Key as string);
      return {
        key: Key,
        name: name,
        lastModified: LastModified,
        size: Size,
        etag: ETag,
        storageClass: StorageClass,
        isDirectory: false, // 判断是否是文件夹
        mime: mime.lookup(name),
      };
    });
};

export const formatPrefixs = (prefixs: S3.CommonPrefix[]): TStoreObject[] => {
  return prefixs.map((obj) => {
    const { Prefix } = obj;
    const name = path.basename(Prefix as string);
    return {
      key: Prefix,
      name: name,
      lastModified: undefined,
      size: 0,
      etag: '',
      storageClass: '',
      isDirectory: true,
    };
  });
};

export type ListParams = {
  bucketName: string;
  prefix: string;
  nextContinuationToken?: string;
  maxKeys?: number;
};
export async function list(
  s3Client: S3.S3Client,
  params: {
    bucketName: string;
    prefix: string;
    nextContinuationToken?: string;
    maxKeys?: number;
  },
) {
  const { bucketName, prefix, nextContinuationToken, maxKeys = 1000 } = params;
  let allObjects: TStoreObject[] = [];
  const command: S3.ListObjectsV2Command = new S3.ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
    ContinuationToken: nextContinuationToken, // 基于此分页
    MaxKeys: maxKeys,
    Delimiter: '/',
  });
  const response = await s3Client.send(command);
  if (response.CommonPrefixes?.length) {
    allObjects = allObjects.concat(formatPrefixs(response.CommonPrefixes));
  }
  if (response.Contents?.length) {
    allObjects = allObjects.concat(formatObjects(response.Contents, prefix));
  }

  return {
    objects: allObjects,
    total: allObjects.length,
    nextContinuationToken: response.NextContinuationToken,
  };
}

// 获取桶内的全部对象
export type ListAllObjectsParams = {
  bucketName: string;
  prefix: string;
};
export async function listAllObjects(s3Client: S3.S3Client, params: ListAllObjectsParams) {
  const { bucketName, prefix } = params;
  let continuationToken = undefined;
  let allKeys: string[] = [prefix];
  let totalSize = 0;
  do {
    const params: S3.ListObjectsV2CommandInput = {
      Bucket: bucketName,
      ContinuationToken: continuationToken,
      Prefix: prefix,
    };
    const command: S3.ListObjectsV2Command = new S3.ListObjectsV2Command(params);
    const response = await s3Client.send(command);

    if (response.CommonPrefixes?.length) {
      allKeys = allKeys.concat(response.CommonPrefixes.map((prefix: any) => prefix.Prefix));
    }
    if (response.Contents?.length) {
      totalSize += response.Contents.reduce((acc, cur) => acc + (cur.Size || 0), 0);
      allKeys = allKeys.concat(
        response.Contents.filter((obj: S3._Object) => obj.Key !== prefix).map((obj: S3._Object) => obj.Key as string),
      );
    }
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  return {
    keys: allKeys,
    total: allKeys.length,
    size: totalSize,
  };
}

// 下载对象
export type GetObjectParams = {
  bucketName: string;
  key: string;
  localPath?: string;
  localFilePath?: string;
};
export async function getObject(s3Client: S3.S3Client, params: GetObjectParams) {
  const { bucketName, key, localPath, localFilePath } = params;
  // 假如传入了文件路径，则直接下载到指定路径
  const targetFilePath = localFilePath || path.join(localPath as string, path.basename(key));
  const command = new S3.GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  const response = await s3Client.send(command);
  (response?.Body as any).pipe(fs.createWriteStream(targetFilePath));
}

// 多选下载对象
export type GetMultiObjectsParams = {
  bucketName: string;
  prefix: string;
  keys: string[];
  localPath: string;
};
export async function getMultiObjects(s3Client: S3.S3Client, params: GetMultiObjectsParams) {
  const { bucketName, prefix, keys, localPath } = params;
  const allKeys = [];

  for (const key of keys) {
    if (isObjectFolder(key)) {
      const { keys: allPrefixKeys } = await listAllObjects(s3Client, { bucketName, prefix: key });
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
      await getObject(s3Client, { bucketName, key, localFilePath });
    }
  }
}

// 下载目录
export type GetFolderParams = {
  bucketName: string;
  prefix: string;
  key: string;
  localPath: string;
};
export async function getFolder(s3Client: S3.S3Client, params: GetFolderParams) {
  const { bucketName, prefix, key, localPath } = params;
  return await getMultiObjects(s3Client, { bucketName, prefix, keys: [key], localPath });
}

export type UploadObjectParams = {
  bucketName: string;
  prefix?: string;
  key?: string;
  localPath: string;
};

export async function uploadObject(s3Client: S3.S3Client, params: UploadObjectParams) {
  const { bucketName, key, localPath } = params;
  const upload = new Upload({
    params: {
      Bucket: bucketName,
      Key: key,
      Body: fs.createReadStream(localPath),
    },
    client: s3Client,
    queueSize: 3,
  });

  upload.on('httpUploadProgress', (progress) => {
    console.log('progress', progress);
  });
  const result = await upload.done();
  return result;
}

export type PutObjectParams = {
  bucketName: string;
  prefix?: string;
  key?: string;
  localPath: string;
};
export async function putObject(s3Client: S3.S3Client, params: PutObjectParams) {
  const { bucketName, prefix, key, localPath } = params;
  const objectKey = key || path.join(prefix as string, path.basename(localPath));

  if (await isDirectory(localPath)) {
    return await putFolder(s3Client, { bucketName, prefix: prefix as string, localPath });
  } else {
    return await uploadObject(s3Client, { bucketName, key: objectKey, localPath });
  }
}

export type PutFolderParams = {
  bucketName: string;
  prefix: string;
  localPath: string;
};
export async function putFolder(s3Client: S3.S3Client, params: PutFolderParams) {
  const { bucketName, prefix, localPath } = params;
  const key = path.join(prefix, path.basename(localPath), '/');
  const command = new S3.PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: Buffer.from(''),
  });
  return await s3Client.send(command);
}

// 多选上传对象
export type PutMultiObjectsParams = {
  bucketName: string;
  prefix: string;
  localPaths: string[];
};
export async function putMultiObjects(s3Client: S3.S3Client, params: PutMultiObjectsParams) {
  const { bucketName, prefix, localPaths } = params;
  const allLocalPaths = await readDirectoryRecursive(localPaths);

  for (const localPath of allLocalPaths) {
    const filePath = localPath.fullPath;
    const remotePath = path.join(prefix, localPath.path);

    await putObject(s3Client, {
      bucketName,
      key: remotePath,
      prefix: prefix,
      localPath: filePath,
    });
  }
}

// 删除桶内的全部对象
export type DeleteFolderParams = {
  bucketName: string;
  key: string;
};
export async function deleteFolder(s3Client: S3.S3Client, params: DeleteFolderParams) {
  const { bucketName, key: prefix } = params; // key as prefix
  const { keys } = await listAllObjects(s3Client, { bucketName, prefix });
  const deleteParams: S3.DeleteObjectsCommandInput = {
    Bucket: bucketName,
    Delete: {
      Objects: [...keys.map((key) => ({ Key: key }))],
      Quiet: true,
    },
  };
  const result = await s3Client.send(new S3.DeleteObjectsCommand(deleteParams));
  return result;
}

// 删除对象
export type DeleteObjectParams = {
  bucketName: string;
  key: string;
};
export async function deleteObject(s3Client: S3.S3Client, params: DeleteObjectParams) {
  const { bucketName, key } = params;
  const command = new S3.DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return await s3Client.send(command);
}

// 删除多个对象
export type DeleteMultiObjectsParams = {
  bucketName: string;
  keys: string[];
};
export async function deleteMultiObjects(s3Client: S3.S3Client, params: DeleteMultiObjectsParams) {
  const { bucketName, keys } = params;
  for (const key of keys) {
    if (isObjectFolder(key)) {
      await deleteFolder(s3Client, { bucketName, key });
    } else {
      await deleteObject(s3Client, { bucketName, key });
    }
  }
}

// 重命名
export type RenameObjectParams = {
  bucketName: string;
  oldKey: string;
  newKey: string;
  prefix?: string;
};
export async function renameObject(s3Client: S3.S3Client, params: RenameObjectParams) {
  const { bucketName, oldKey, newKey, prefix = '' } = params;
  const command = new S3.CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `/${bucketName}/${oldKey}`,
    Key: `${prefix}${newKey}`,
  });
  await s3Client.send(command);
  await deleteObject(s3Client, { bucketName, key: oldKey });
}

// 重命名目录
export type RenameFolderParams = {
  bucketName: string;
  oldKey: string;
  newKey: string;
};
export async function renameFolder(s3Client: S3.S3Client, params: RenameFolderParams) {
  const { bucketName, oldKey, newKey } = params;
  const newKeyPrefix = path.join(path.dirname(oldKey), newKey, '/'); // 计算新 prefix

  const { keys } = await listAllObjects(s3Client, { bucketName, prefix: oldKey });
  for (const key of keys) {
    const objectNewKey = key.replace(oldKey, newKeyPrefix);
    await renameObject(s3Client, { bucketName, oldKey: key, newKey: objectNewKey });
  }
}

// 获取资源地址
export type GetSourceUrlParams = {
  key: string;
  bucketName: string;
};
export async function getSourceUrl(s3Client: S3.S3Client, params: GetSourceUrlParams) {
  const { key, bucketName } = params;
  const commandParams = { Bucket: bucketName, Key: key };
  //   @ts-ignore
  const headObjectCommand = new S3.HeadObjectCommand(commandParams);
  const response = await s3Client.send(headObjectCommand);
  const etag = (response.ETag as string).replaceAll('"', '');
  // 基于 etag 生成临时文件名
  const tmpFileName = path.join(getTempPath(), `${etag}${path.extname(key)}`);
  const result = `file://${tmpFileName}`;
  if (fs.existsSync(tmpFileName)) {
    return result;
  } else {
    const getObjectcommand = new S3.GetObjectCommand(commandParams);
    const response = await s3Client.send(getObjectcommand);
    const writerStream = fs.createWriteStream(tmpFileName);
    await streamToPromise(response.Body, writerStream);
    return result;
  }
}
