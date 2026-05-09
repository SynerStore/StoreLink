import path from 'node:path';
import { pathToFileURL } from 'node:url';
import mime from 'mime-types';
import fs from 'fs-extra';
import { shell } from 'electron';

import { filesSort, isHiddenFile } from '@/main/utils/fs';
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

  return filesSort(folders as any[]);
}

// 删除桶内的全部对象
export type DeleteFileParams = {
  file: string;
};
export async function deleteFile(params: DeleteFileParams) {
  const { file } = params;
  try {
    return shell.trashItem(file);
  } catch (error) {
    // Fallback for worker thread where electron is not available
    return fs.remove(file);
  }
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
  oldKey?: string;  // Alias for oldName
  newKey?: string;  // Full target path
};

export async function rename(params: RenameParams) {
  const oldName = params.oldName || params.oldKey;
  const newName = params.newKey || params.newName;
  const targetPath = path.isAbsolute(newName) ? newName : path.join(path.dirname(oldName), newName);
  const result = await fs.rename(oldName, targetPath);
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

export async function getSourceUrl(params: GetSourceUrlParams) {
  const { key } = params;
  const src = pathToFileURL(key).href;
  const mimeValue = mime.lookup(key) || '';
  let content = '';
  // 对于文本文件，读取内容
  if (/text\/.{0,}/.test(mimeValue) || mimeValue === 'application/json' || mimeValue.includes('xml')) {
    try {
      content = await fs.readFile(key, { encoding: 'utf-8' });
    } catch (e) {
      console.error(e);
    }
  } 
  // 对于 HEIC 图片，读取为 base64
  else if (mimeValue === 'image/heic' || key.toLowerCase().endsWith('.heic')) {
    try {
      const buffer = await fs.readFile(key);
      // 返回 base64 数据 URL
      content = `data:${mimeValue || 'image/heic'};base64,${buffer.toString('base64')}`;
      // 注意：这里我们将 base64 放在 content 字段中，前端需要识别处理
      // 或者我们可以直接把 content 赋给 src？
      // 为了保持兼容性，我们最好不要修改 src 的 file:// 协议，而是让 content 携带数据
    } catch (e) {
      console.error(e);
    }
  }

  return {
    src,
    mime: mimeValue,
    content,
  };
}

export type CopyFileParams = {
  sourceKey: string;
  targetPath: string;
  targetKey?: string; // Optional: full target path
  file?: string;      // Alias for sourceKey
  newFile?: string;   // Alias for targetKey
};

export async function copyFile(params: CopyFileParams) {
  // Support both parameter naming conventions
  const sourceKey = params.sourceKey || params.file;
  let destPath: string;

  if (params.targetKey || params.newFile) {
    // If full target path is provided, use it directly
    destPath = params.targetKey || params.newFile!;
  } else {
    // If only targetPath (directory) is provided, construct full path
    const fileName = path.basename(sourceKey);
    destPath = path.join(params.targetPath, fileName);
  }

  // Ensure target directory exists
  const targetDir = path.dirname(destPath);
  await fs.ensureDir(targetDir);

  await fs.copy(sourceKey, destPath);
}

export async function moveFile(params: CopyFileParams) {
  const { sourceKey, targetPath } = params;
  // For LocalStore, targetPath is usually the destination directory
  // sourceKey is the full path of the source file
  const fileName = path.basename(sourceKey);
  const destPath = path.join(targetPath, fileName);

  // Ensure target directory exists (though targetPath should be valid)
  // Check if it's move or copy? This function is named moveFile.
  await fs.move(sourceKey, destPath);
}
