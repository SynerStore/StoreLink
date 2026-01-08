import path from 'node:path';
import mime from 'mime-types';
import fs from 'fs-extra';
import { shell } from 'electron';

import { isGetFileContent } from '@/utils';
import { filesSort, isHiddenFile } from '@/main/utils';
import { TStoreObject } from '@/types';

export const formatObjects = async (filePath: string): Promise<TStoreObject | null> => {
  try {
    await fs.access(filePath);
    const stats = await fs.stat(filePath);
    const isHdFile = await isHiddenFile(filePath);
    const result = {
      key: filePath,
      name: path.basename(filePath),
      lastModified: stats.mtimeMs,
      size: stats.size,
      etag: '',
      storageClass: '',
      isHiddenFile: isHdFile,
      isDirectory: stats.isDirectory(),
      mime: mime.lookup(filePath),
      isSymbolicLink: stats.isSymbolicLink(),
    };
    return result;
  } catch (_error) {
    return null;
  }
};

export type ListParams = {
  prefix: string;
};
export async function list(root: string, params: ListParams) {
  const prefix = path.join(root, params.prefix);
  const files = await fs.readdir(prefix);
  const filesObjects = await Promise.all(files.map((file) => formatObjects(path.join(prefix, file))));
  const accessFiles = filesObjects.filter((file) => !!file);
  return filesSort(accessFiles as any[]);
}

export async function listDir(root: string, params: ListParams) {
  let prefix = params.prefix;
  // Handle absolute path if it starts with root (robustness for UI passing keys back)
  if (path.isAbsolute(prefix) && prefix.startsWith(root)) {
    // It's already an absolute path including root
  } else {
    prefix = path.join(root, prefix);
  }

  const dirents = await fs.readdir(prefix, { withFileTypes: true });
  const folders = dirents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => {
      const fullPath = path.join(prefix, dirent.name);
      return {
        key: fullPath,
        name: dirent.name,
        lastModified: 0, // Not needed for tree
        size: 0,
        etag: '',
        storageClass: '',
        isDirectory: true,
        mime: '',
        isHiddenFile: dirent.name.startsWith('.'), // Simple check
      } as TStoreObject;
    });

  return filesSort(folders);
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

export type PutObjectParams = {
  prefix: string;
  localPath: string;
};

export async function putObject(root: string, params: PutObjectParams) {
  const { prefix, localPath } = params;
  const targetFilePath = path.join(root, prefix, path.basename(localPath));
  if (targetFilePath === localPath) return; // 本地复制到本地忽略
  const result = await fs.copyFile(localPath, targetFilePath);
  return result;
}

export type PutMultiObjectsParams = {
  prefix: string;
  localPaths: string[];
};

export async function putMultiObjects(root: string, params: PutMultiObjectsParams) {
  const { prefix, localPaths } = params;
  const promises = localPaths.map((localPath) => putObject(root, { prefix, localPath }));
  return Promise.all(promises);
}

export type PutFolderParams = {
  prefix: string;
  localPath: string;
};

export async function putFolder(root: string, params: PutFolderParams) {
  const { prefix, localPath } = params;
  const targetFilePath = path.join(root, prefix, path.basename(localPath));
  await fs.ensureDir(targetFilePath);
  await fs.copy(localPath, targetFilePath);
}

export type GetSourceUrlParams = {
  key: string;
};

export async function getSourceUrl(root: string, params: GetSourceUrlParams) {
  const { key } = params;
  return key;
}

export type CopyFileParams = {
  sourceKey: string;
  targetPath: string;
};

export async function copyFile(root: string, params: CopyFileParams) {
  const { sourceKey, targetPath } = params;
  // For LocalStore, targetPath is usually the destination directory
  // sourceKey is the full path of the source file
  const fileName = path.basename(sourceKey);
  const destPath = path.join(targetPath, fileName);

  // Ensure target directory exists (though targetPath should be valid)
  // Check if it's move or copy? This function is named copyFile.
  await fs.copy(sourceKey, destPath);
}
