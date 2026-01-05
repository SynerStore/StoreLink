import path from 'node:path';
import mime from 'mime-types';
import fs from 'fs-extra';
import SftpClient from 'ssh2-sftp-client';

import { filesSort, runTasksSequentially, getTempPath, getMd5ByString } from '@/main/utils';
import { TStoreObject } from '@/types';

type SftpListFile = {
  type: 'd' | '-' | 'l';
  name: string;
  size: number;
  modifyTime: number;
  accessTime?: number;
};

export const formatObjects = async (prefix: string, file: SftpListFile): Promise<TStoreObject | null> => {
  const filePath = path.join(prefix || '/', file.name);
  return {
    key: filePath,
    name: file.name,
    lastModified: file.modifyTime,
    size: file.size,
    etag: '',
    storageClass: '',
    isDirectory: file.type === 'd',
    mime: mime.lookup(filePath),
    isSymbolicLink: file.type === 'l',
  };
};

export type ListParams = {
  prefix: string;
};
export async function list(client: SftpClient, params: ListParams) {
  debugger
  const files = await client.list(params.prefix || '/');
debugger
  const filesObjects = await Promise.all(files.map((file: any) => formatObjects(params.prefix, file as SftpListFile)));
  return filesSort(filesObjects as any[]);
}

export type GetFileParams = {
  key: string;
  localPath?: string;
  localFilePath?: string;
};
export async function getFile(client: SftpClient, params: GetFileParams) {
  const { key, localPath, localFilePath } = params;
  const targetFilePath = localFilePath ? localFilePath : path.join(localPath as string, path.basename(key));
  await client.fastGet(key, targetFilePath);
  return;
}

export type GetFolderParams = {
  key: string;
  localPath?: string;
};
async function downloadDirRecursive(client: SftpClient, remoteDir: string, localDirTarget: string) {
  await fs.ensureDir(localDirTarget);
  const entries = await client.list(remoteDir);
  for (const entry of entries as any[]) {
    const name = entry.name as string;
    const remotePath = path.posix.join(remoteDir, name);
    const localPath = path.join(localDirTarget, name);
    if (entry.type === 'd') {
      await downloadDirRecursive(client, remotePath, localPath);
    } else {
      await client.fastGet(remotePath, localPath);
    }
  }
}
export async function getFolder(client: SftpClient, params: GetFolderParams) {
  const { key, localPath } = params;
  const targetDir = path.join(localPath as string, path.basename(key));
  await downloadDirRecursive(client, key, targetDir);
  return;
}

export type DeleteFileParams = {
  file: string;
  isDirectory: boolean;
};
export async function deleteFile(client: SftpClient, params: DeleteFileParams) {
  const { file } = params;
  return client.delete(file);
}

export type DeleteFolderParams = {
  file: string;
  isDirectory: boolean;
};
export async function deleteFolder(client: SftpClient, params: DeleteFolderParams) {
  const { file } = params;
  return client.rmdir(file, true);
}

export type DeleteMultiFilesParams = {
  files: { file: string; isDirectory: boolean }[];
};
export async function deleteMultiObjects(client: SftpClient, params: DeleteMultiFilesParams) {
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
export async function rename(client: SftpClient, params: RenameParams) {
  const { oldName, newName } = params;
  const dirname = path.dirname(oldName);
  const result = await client.rename(oldName, path.join(dirname, newName));
  return result;
}

export type PutFileParams = {
  localPaths: string[];
  prefix: string;
};

export async function putFile(client: SftpClient, params: PutFileParams) {
  const { localPaths, prefix } = params;
  const promises = localPaths.map(async (localPath) => {
    const remotePath = path.posix.join(prefix || '/', path.basename(localPath));
    const result = await client.fastPut(localPath, remotePath);
    return result;
  });
  return runTasksSequentially(promises);
}

export type PutFolderParams = {
  prefix: string;
  localPath: string;
};
export async function putFolder(client: SftpClient, params: PutFolderParams) {
  const { localPath, prefix } = params;
  const remoteFolderPath = path.posix.join(prefix || '/', path.basename(localPath));
  const result = await client.mkdir(remoteFolderPath, true);
  return result;
}

export type GetSourceUrlParams = {
  key: string;
  connectionId: string;
  lastModified: number;
};
export async function getSourceUrl(client: SftpClient, params: GetSourceUrlParams) {
  const { key, connectionId, lastModified } = params;
  const etag = getMd5ByString(`${connectionId}-${lastModified}-${key}`);
  const tmpFileName = path.join(getTempPath(), `${etag}${path.extname(key)}`);
  const filePath = `file://${tmpFileName}`;
  if (!fs.existsSync(tmpFileName)) {
    await client.fastGet(key, tmpFileName);
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
