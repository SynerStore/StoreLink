// https://www.npmjs.com/package/webdav
import path from 'node:path';
import mime from 'mime-types';
import fs from 'fs-extra';
import { WebDAVClient, FileStat } from 'webdav';

import { filesSort, isObjectFolder, readDirectoryRecursive } from '@/main/utils/fs';
import { runTasksSequentially } from '@/main/utils/helpers';
import { getTempPath } from '@/main/utils/path';
import { streamToPromise } from '@/main/utils/stream';
import { getMd5ByString } from '@/main/utils/crypto';
import { TStoreObject } from '@/types';

export const formatObjects = async (file: FileStat): Promise<TStoreObject | null> => {
  const { type, size, lastmod, basename, filename, etag } = file;
  const isDirectory = type === 'directory';
  const key = isDirectory ? `${filename}/` : filename; //  统一文件夹以/结尾
  return {
    key: key,
    name: basename,
    lastModified: lastmod,
    size: size,
    etag: etag,
    storageClass: '',
    isDirectory: isDirectory,
    mime: mime.lookup(basename),
    isSymbolicLink: undefined,
  };
};

export type ListParams = {
  prefix: string;
};
export async function list(client: WebDAVClient, params: ListParams) {
  const result = await client.getDirectoryContents(params.prefix || '/');
  const files = Array.isArray(result) ? result : Array.isArray(result.data) ? result.data : [];
  const filesObjects = await Promise.all(files.map((file: FileStat) => formatObjects(file)));
  return filesSort(filesObjects as any[]);
}

export type GetFileParams = {
  key: string;
  localPath?: string;
  localFilePath?: string;
};
export async function getFile(client: WebDAVClient, params: GetFileParams) {
  const { key, localPath, localFilePath } = params;
  const targetFilePath = localFilePath ? localFilePath : path.join(localPath as string, path.basename(key));
  const writerStream = fs.createWriteStream(targetFilePath);
  await client.createReadStream(key).pipe(writerStream);
  return;
}

// 获取文件夹下的所有文件和文件夹名称
export type ListAllObjectsParams = {
  prefix: string;
};
export async function listAllObjects(client: WebDAVClient, params: ListParams) {
  const { prefix } = params;
  const allKeys: Set<string> = new Set([prefix]);
  const result = await list(client, { prefix });
  for (const file of result) {
    if (file.isDirectory) {
      allKeys.add(file.key);
      const subResult = await list(client, { prefix: file.key });
      for (const subFile of subResult) {
        allKeys.add(subFile.key);
      }
    } else {
      allKeys.add(file.key);
    }
  }
  return {
    keys: Array.from(allKeys),
  };
}

// 多选下载对象
export type GetMultiObjectsParams = {
  prefix: string;
  keys: string[];
  localPath: string;
};
export async function getMultiObjects(client: WebDAVClient, params: GetMultiObjectsParams) {
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

  for (const pathKey of allKeys) {
    const realtivePath = pathKey.replace(prefix, '');
    const localFilePath = path.join(localPath, realtivePath);
    if (isObjectFolder(pathKey)) {
      await fs.ensureDir(localFilePath);
    } else {
      await getFile(client, { key: pathKey, localFilePath: localFilePath });
    }
  }
}

export type GetFolderParams = {
  key: string;
  prefix: string;
  localPath: string;
  isDirectory?: boolean;
};

export async function getFolder(client: WebDAVClient, params: GetFolderParams) {
  const { prefix, key, localPath } = params;
  return await getMultiObjects(client, { prefix, keys: [key], localPath });
}

export type DeleteFileParams = {
  file: string;
};
export async function deleteFile(client: WebDAVClient, params: DeleteFileParams) {
  const { file } = params;
  return client.deleteFile(file); // webdev 支持删除文件和文件夹以及递归删除文件夹下的所有文件
}

// // 批量删除
export type DeleteMultiFilesParams = {
  files: { file: string; isDirectory: boolean }[];
};
export async function deleteMultiFiles(client: WebDAVClient, params: DeleteMultiFilesParams) {
  const { files } = params;
  const tasks = [];
  for (const file of files) {
    tasks.push(deleteFile(client, file));
  }
  return runTasksSequentially(tasks);
}

export type RenameParams = {
  oldName: string;
  newName: string;
};
export async function rename(client: WebDAVClient, params: RenameParams) {
  const { oldName, newName } = params;
  const dirname = path.dirname(oldName);
  const result = await client.moveFile(oldName, path.join(dirname, newName));
  return result;
}

export type PutFileParams = {
  localPath: string;
  prefix: string;
};

export async function putFile(client: WebDAVClient, params: PutFileParams) {
  const { localPath, prefix } = params;
  const remotePath = path.join(prefix || '/', path.basename(localPath));
  const fileBuffer = await fs.readFile(localPath);
  const result = await client.putFileContents(remotePath, fileBuffer, { overwrite: false });
  return result;
}

export type PutFolderParams = {
  prefix: string;
  localPath: string;
};
export async function putFolder(client: WebDAVClient, params: PutFolderParams) {
  const { localPath, prefix } = params;
  const remoteFolderPath = path.join(prefix, path.basename(localPath));
  const result = await client.createDirectory(remoteFolderPath);
  return result;
}

// 多选上传对象
export type PutMultiObjectsParams = {
  prefix: string;
  localPaths: string[];
};
export async function putMultiObjects(client: WebDAVClient, params: PutMultiObjectsParams) {
  const { prefix, localPaths } = params;
  const allLocalPaths = await readDirectoryRecursive(localPaths);
  for (const localPath of allLocalPaths) {
    const filePath = localPath.fullPath;
    if (isObjectFolder(filePath)) {
      await putFolder(client, { prefix: filePath, localPath: filePath });
    } else {
      await putFile(client, {
        prefix: prefix,
        localPath: filePath,
      });
    }
  }
}

/**
 * webdav 文件预览需要下载
 */
export type GetSourceUrlParams = {
  key: string;
  connectionId: string;
  lastModified: number;
};
export async function getSourceUrl(client: WebDAVClient, _config: any, params: GetSourceUrlParams) {
  const { key, connectionId, lastModified } = params;
  const etag = getMd5ByString(`${connectionId}-${lastModified}-${key}`);
  const tmpFileName = path.join(getTempPath(), `${etag}${path.extname(key)}`);
  const filePath = `file://${tmpFileName}`;
  if (!fs.existsSync(tmpFileName)) {
    const readerStream = client.createReadStream(key);
    const writerStream = fs.createWriteStream(tmpFileName);
    await streamToPromise(readerStream, writerStream);
  }
  const mimeValue = mime.lookup(filePath) || '';
  return {
    src: filePath,
    mime: mimeValue,
    content: /text\/.{0,}/.test(mimeValue) ? await fs.readFile(tmpFileName, { encoding: 'utf-8' }) : '',
  };
}
