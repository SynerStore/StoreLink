import fs from 'node:fs/promises';
import path from 'node:path';
import { readdirpPromise } from 'readdirp';
export const isFile = async (path: string) => {
  try {
    const stat = await fs.stat(path);
    return stat.isFile();
  } catch (error) {
    return false;
  }
};

export const isDirectory = async (path: string) => {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
};

/**
 * 给定一组路径，返回所有文件路径
 * 忽略略掉.DS_Store和.git
 * */
export const readDirectoryRecursive = async (roots: string | string[], basename: string = ''): Promise<any[]> => {
  const paths = [];
  if (Array.isArray(roots)) {
    for (const root of roots) {
      const files = await readDirectoryRecursive(root, basename);
      paths.push(...files);
    }
  } else {
    const nextBaseName = path.join(basename, path.basename(roots));
    paths.push({
      fullPath: roots,
      path: nextBaseName,
    });
    if (await isDirectory(roots)) {
      const files = await readdirpPromise(roots, {
        fileFilter: (stat) => stat.basename !== '.DS_Store',
        directoryFilter: (stat) => stat.basename !== '.git',
        type: 'all',
      });
      paths.push(
        ...files.map((file) => {
          console.log('file', file);
          return {
            fullPath: file.fullPath,
            path: path.join(nextBaseName, file.path),
          };
        }),
      );
    }
  }

  return paths;
};
