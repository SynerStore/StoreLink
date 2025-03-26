import fs from 'fs-extra';
import path from 'node:path';
import { readdirpPromise } from 'readdirp';
import crypto from 'node:crypto';
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

export const isObjectFolder = (key: string) => {
  return key.endsWith('/');
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

export const createFileSHA256 = async (filePath: string) => {
  const hash = crypto.createHash('sha256');
  const fileStream = fs.createReadStream(filePath);
  fileStream.on('data', (chunk) => {
    hash.update(chunk);
  });
  await new Promise((resolve, reject) => {
    fileStream.on('end', () => resolve(null));
    fileStream.on('error', reject);
  });
  return hash.digest('hex');
};

// 文件排名
export const filesSort = (files: Array<{ name: string; isDirectory: boolean }>) => {
  return files
    .sort((a: { name: string; isDirectory: boolean }, b: { name: string; isDirectory: boolean }) => {
      // 将文件名拆分为字母、数字、符号的混合数组
      const splitA = a.name.split(/(\d+)/);
      const splitB = b.name.split(/(\d+)/);

      // 逐段比较
      for (let i = 0; i < Math.max(splitA.length, splitB.length); i++) {
        const segmentA = splitA[i] || '';
        const segmentB = splitB[i] || '';

        // 数字段按数值比较
        if (i % 2 === 1) {
          const numA = parseInt(segmentA, 10);
          const numB = parseInt(segmentB, 10);
          if (numA !== numB) return numA - numB;
        }
        // 非数字段按自然排序比较
        else {
          const compareResult = segmentA.localeCompare(segmentB, 'en', { sensitivity: 'base' });
          if (compareResult !== 0) return compareResult;
        }
      }
      return 0;
    })
    .sort((a: any) => (a.isDirectory ? -1 : 1)); // 文件夹排在前面;
};
