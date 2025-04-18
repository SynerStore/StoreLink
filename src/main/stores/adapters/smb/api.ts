import path from 'node:path';
import mime from 'mime-types';
import fs from 'fs-extra';
import Client from 'samba-client';

import { filesSort, runTasksSequentially, getTempPath, getMd5ByString } from '@/main/utils';
import { TStoreObject } from '@/types';

export const formatObjects = async (prefix: string, file: any): Promise<TStoreObject | null> => {
  const filePath = path.join(prefix, file.filename);
  return {
    key: filePath,
    name: file.basename,
    lastModified: file.lastmod,
    size: file.size,
    etag: file.etag,
    storageClass: '',
    isDirectory: file.type === 'directory',
    mime: mime.lookup(filePath),
    isSymbolicLink: undefined,
  };
};

export type ListParams = {
  prefix: string;
};
export async function list(client: Client, params: ListParams) {
  const files = await client.list(params.prefix || '/');
  const filesObjects = await Promise.all(files.map((file: any) => formatObjects(params.prefix, file)));
  return filesSort(filesObjects as any[]);
}

export type GetFileParams = {
  key: string;
  localPath?: string;
};
// export async function getFile(client: Client, params: GetFileParams) {
//   const { key, localPath } = params;
//   const targetFilePath = path.join(localPath as string, path.basename(key));
//   const writerStream = fs.createWriteStream(targetFilePath);
//   await client.downloadTo(writerStream, key);
//   client.trackProgress((info) => {
//     console.log('File', info.name);
//     console.log('Type', info.type);
//     console.log('Transferred', info.bytes);
//     console.log('Transferred Overall', info.bytesOverall);
//   });
//   return;
// }

// export type GetFolderParams = {
//   key: string;
//   localPath?: string;
// };
// export async function getFolder(client: Client, params: GetFolderParams) {
//   const { key, localPath } = params;
//   const targetFilePath = path.join(localPath as string, path.basename(key));
//   await client.downloadToDir(targetFilePath, key);
//   return;
// }

// export type DeleteFileParams = {
//   file: string;
//   isDirectory: boolean;
// };
// export async function deleteFile(client: Client, params: DeleteFileParams) {
//   const { file } = params;
//   return client.remove(file);
// }

// export type DeleteFolderParams = {
//   file: string;
//   isDirectory: boolean;
// };
// export async function deleteFolder(client: Client, params: DeleteFolderParams) {
//   const { file } = params;
//   return client.removeDir(file);
// }

// // 批量删除
// export type DeleteMultiFilesParams = {
//   files: { file: string; isDirectory: boolean }[];
// };
// export async function deleteMultiObjects(client: Client, params: DeleteMultiFilesParams) {
//   const { files } = params;
//   const tasks = [];
//   for (const file of files) {
//     if (file.isDirectory) {
//       tasks.push(deleteFolder(client, file));
//     } else {
//       tasks.push(deleteFile(client, file));
//     }
//   }
//   return runTasksSequentially(tasks);
// }

// export type RenameParams = {
//   oldName: string;
//   newName: string;
// };
// export async function rename(client: Client, params: RenameParams) {
//   const { oldName, newName } = params;
//   const dirname = path.dirname(oldName);
//   const result = await client.rename(oldName, path.join(dirname, newName));
//   return result;
// }

// export type PutFileParams = {
//   localPaths: string[];
//   prefix: string;
// };

// export async function putFile(client: Client, params: PutFileParams) {
//   const { localPaths, prefix } = params;
//   const promises = localPaths.map(async (localPath) => {
//     const remotePath = path.join(prefix || '/', path.basename(localPath));
//     const result = await client.uploadFrom(localPath, remotePath);
//     return result;
//   });
//   return runTasksSequentially(promises);
// }

// export type PutFolderParams = {
//   prefix: string;
//   localPath: string;
// };
// export async function putFolder(client: Client, params: PutFolderParams) {
//   const { localPath, prefix } = params;
//   const remoteFolderPath = path.join(prefix, path.basename(localPath));
//   const result = await client.ensureDir(remoteFolderPath);
//   return result;
// }

// /**
//  * ftp 文件预览需要下载
//  */
// export type GetSourceUrlParams = {
//   key: string;
//   connectionId: string;
//   lastModified: number;
// };
// export async function getSourceUrl(client: Client, params: GetSourceUrlParams) {
//   const { key, connectionId, lastModified } = params;
//   const etag = getMd5ByString(`${connectionId}-${lastModified}-${key}`);
//   const tmpFileName = path.join(getTempPath(), `${etag}${path.extname(key)}`);
//   const filePath = `file://${tmpFileName}`;
//   if (!fs.existsSync(tmpFileName)) {
//     const writerStream = fs.createWriteStream(tmpFileName);
//     await client.downloadTo(writerStream, key);
//   }
//   const mimeValue = mime.lookup(filePath) || '';
//   let content = '';
//   if (/text\/.{0,}/.test(mimeValue)) {
//     content = await fs.readFile(tmpFileName, { encoding: 'utf-8' });
//   }
//   return {
//     src: filePath,
//     mime: mimeValue,
//     content: content,
//   };
// }
