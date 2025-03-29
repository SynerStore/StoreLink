import path from 'node:path';
import mime from 'mime-types';
import { Client, FileInfo, FileType } from 'basic-ftp';

import { filesSort, runTasksSequentially } from '@/main/utils';
import { TStoreObject } from '../store';

export const formatObjects = async (prefix: string, file: FileInfo): Promise<TStoreObject | null> => {
  const filePath = path.join(prefix, file.name);
  return {
    key: filePath,
    name: file.name,
    lastModified: file.modifiedAt,
    size: file.size,
    etag: '',
    storageClass: '',
    isDirectory: file.type === FileType.Directory,
    mime: mime.lookup(filePath),
    isSymbolicLink: file.type === FileType.SymbolicLink,
  };
};

export type ListParams = {
  prefix: string;
};
export async function list(client: Client, params: ListParams) {
  const files = await client.list(params.prefix || '/');
  const filesObjects = await Promise.all(files.map((file: FileInfo) => formatObjects(params.prefix, file)));
  return filesSort(filesObjects as any[]);
}

export type DeleteFileParams = {
  file: string;
  isDirectory: boolean;
};
export async function deleteFile(client: Client, params: DeleteFileParams) {
  const { file } = params;
  return client.remove(file);
}

export type DeleteFolderParams = {
  file: string;
  isDirectory: boolean;
};
export async function deleteFolder(client: Client, params: DeleteFolderParams) {
  const { file } = params;
  return client.removeDir(file);
}

// 批量删除
export type DeleteMultiFilesParams = {
  files: { file: string; isDirectory: boolean }[];
};
export async function deleteMultiObjects(client: Client, params: DeleteMultiFilesParams) {
  const { files } = params;
  const tasks = [];
  for (const file of files) {
    if (file.isDirectory) {
      tasks.push(deleteFolder(client, file));
    } else {
      tasks.push(deleteFile(client, file));
    }
  }
  return runTasksSequentially(tasks);
}

export type RenameParams = {
  oldName: string;
  newName: string;
};
export async function rename(client: Client, params: RenameParams) {
  const { oldName, newName } = params;
  const dirname = path.dirname(oldName);
  const result = await client.rename(oldName, path.join(dirname, newName));
  return result;
}

export type PutFileParams = {
  localPaths: string[];
  prefix: string;
};

export async function putFile(client: Client, params: PutFileParams) {
  const { localPaths, prefix } = params;
  const promises = localPaths.map(async (localPath) => {
    const remotePath = path.join(prefix || '/', path.basename(localPath));
    const result = await client.uploadFrom(localPath, remotePath);
    return result;
  });
  return runTasksSequentially(promises);
}

export type PutFolderParams = {
  prefix: string;
  localPath: string;
};
export async function putFolder(client: Client, params: PutFolderParams) {
  const { localPath, prefix } = params;
  const remoteFolderPath = path.join(prefix, path.basename(localPath));
  const result = await client.ensureDir(remoteFolderPath);
  return result;
}
