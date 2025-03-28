import path from 'node:path';
import mime from 'mime-types';
import fs from 'fs-extra';
import { shell } from 'electron';

import { filesSort } from '@/main/utils';
import { TStoreObject } from '../store';

export const formatObjects = async (filePath: string): Promise<TStoreObject> => {
  const stats = await fs.stat(filePath);
  const result = {
    key: filePath,
    name: path.basename(filePath),
    lastModified: stats.mtimeMs,
    size: stats.size,
    etag: '',
    storageClass: '',
    isDirectory: stats.isDirectory(),
    mime: mime.lookup(filePath),
    isSymbolicLink: stats.isSymbolicLink(),
  };
  return result;
};

export type ListParams = {
  prefix: string;
};
export async function list(root: string, params: ListParams) {
  const prefix = path.join(root, params.prefix);
  const files = await fs.readdir(prefix);
  const filesObjects = await Promise.all(files.map((file) => formatObjects(path.join(prefix, file))));
  return filesSort(filesObjects as any[]);
}

// 删除桶内的全部对象
export type DeleteFileParams = {
  file: string;
};
export async function deleteFile(params: DeleteFileParams) {
  const { file } = params;
  return shell.trashItem(file);
}

// 删除桶内的全部对象
export type DeleteMultiFilesParams = {
  files: string[];
};
export async function deleteMultiFiles(params: DeleteMultiFilesParams) {
  const { files } = params;
  const promises = files.map((file: string) => deleteFile({ file }));
  return Promise.all(promises);
}

export type RenameParams = {
  oldName: string;
  newName: string;
};
export async function rename(params: RenameParams) {
  const { oldName, newName } = params;
  const dirname = path.dirname(oldName);
  const result = await fs.rename(oldName, path.join(dirname, newName));
  return result;
}
