import path from 'node:path';
import fs from 'fs-extra';
import mime from 'mime-types';
import { Readable } from 'node:stream';
import { filesSort, isObjectFolder, readDirectoryRecursive } from '@/main/utils/fs';
import { getTempPath } from '@/main/utils/path';
import { streamToPromise } from '@/main/utils/stream';
import { getMd5ByString } from '@/main/utils/crypto';
import { TStoreObject } from '@/types';

export type SynologyClient = {
  FileStation?: any;
};

export const formatShares = (shares: any[]): TStoreObject[] => {
  return (shares || []).map((item: any) => ({
    key: `${item.path}/`,
    name: item.name,
    lastModified: item?.additional?.time?.mtime,
    size: 0,
    etag: '',
    storageClass: '',
    isDirectory: true,
    mime: undefined,
  }));
};

export const formatFiles = (files: any[]): TStoreObject[] => {
  return (files || []).map((f: any) => {
    const isdir = !!f.isdir;
    const key = isdir ? `${f.path}/` : f.path;
    const baseName = f.name || path.basename(key);
    const size = isdir ? 0 : f?.additional?.size;
    const lastModified = f?.additional?.time?.mtime;
    return {
      key,
      name: baseName,
      lastModified,
      size,
      etag: '',
      storageClass: '',
      isDirectory: isdir,
      mime: isdir ? undefined : mime.lookup(baseName),
    };
  });
};

export type ListParams = { prefix: string };
export async function list(client: SynologyClient, params: ListParams) {
  const { prefix } = params;
  const fixedPrefix = prefix.replace(/\/$/, ''); // 删除结尾的 /
  if (!client?.FileStation) throw new Error('synology_api_missing');
  if (!fixedPrefix || fixedPrefix === '/') {
    const res = await client.FileStation.getShareFileList({
      limit: 1000,
      offset: 0,
      filetype: 'all',
      sort_direction: 'ASC',
      sort_by: 'name',
      additional: ['real_path', 'owner', 'time'],
      onlywritable: false,
    });
    const arr = formatShares(res?.data?.shares || []);
    const safe = arr.map((it) => ({ ...it, name: (it.name as string) || '' })) as Array<
      { name: string; isDirectory: boolean } & any
    >;
    return filesSort(safe) as any[];
  }
  const res = await client.FileStation.getFileList({
    folder_path: fixedPrefix, // 删除结尾的 /
    filetype: 'all',
    additional: ['real_path', 'size', 'owner', 'time', 'perm', 'type'],
    limit: 1000,
    offset: 0,
    sort_by: 'name',
    sort_direction: 'ASC',
  });
  const arr = formatFiles(res?.data?.files || []);
  const safe = arr.map((it) => ({ ...it, name: (it.name as string) || '' })) as Array<
    { name: string; isDirectory: boolean } & any
  >;
  return filesSort(safe) as any[];
}

export type GetFileParams = {
  key: string;
  localPath?: string;
  localFilePath?: string;
};
export async function getFile(client: SynologyClient, params: GetFileParams) {
  const { key, localPath, localFilePath } = params;
  if (!client?.FileStation?.getDownloadFile) throw new Error('not_supported');
  const targetFilePath = localFilePath ? localFilePath : path.join(localPath as string, path.basename(key));
  const result = await client.FileStation.getDownloadFile({ path: key, responseType: 'stream' });

  if (result instanceof Readable) {
    const writeStream = fs.createWriteStream(targetFilePath);
    await streamToPromise(result, writeStream);
    return;
  }
  throw new Error('download_failed');
}

export type ListAllObjectsParams = { prefix: string };
export async function listAllObjects(client: SynologyClient, params: ListAllObjectsParams) {
  const { prefix } = params;
  const allKeys: Set<string> = new Set([prefix]);
  const result = await list(client, { prefix });
  for (const file of result) {
    if (file.isDirectory) {
      allKeys.add(file.key as string);
      const subResult = await list(client, { prefix: file.key as string });
      for (const subFile of subResult) {
        allKeys.add(subFile.key as string);
      }
    } else {
      allKeys.add(file.key as string);
    }
  }
  return { keys: Array.from(allKeys) };
}

export type GetMultiObjectsParams = {
  prefix: string;
  keys: string[];
  localPath: string;
};
export async function getMultiObjects(client: SynologyClient, params: GetMultiObjectsParams) {
  const { prefix, keys, localPath } = params;
  const allKeys: string[] = [];
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
      await getFile(client, { key: pathKey, localFilePath });
    }
  }
}

export type GetFolderParams = {
  key: string;
  prefix: string;
  localPath: string;
  isDirectory?: boolean;
};
export async function getFolder(client: SynologyClient, params: GetFolderParams) {
  const { prefix, key, localPath } = params;
  return await getMultiObjects(client, { prefix, keys: [key], localPath });
}

export type DeleteFileParams = { file: string };
export async function deleteFile(client: SynologyClient, params: DeleteFileParams) {
  const { file } = params;
  if (!client?.FileStation?.delete) throw new Error('not_supported');
  return client.FileStation.delete({ path: file });
}

export type DeleteMultiFilesParams = {
  files: { file: string; isDirectory: boolean }[];
};
export async function deleteMultiFiles(client: SynologyClient, params: DeleteMultiFilesParams) {
  const { files } = params;
  if (!client?.FileStation?.delete) throw new Error('not_supported');
  for (const f of files) {
    await client.FileStation.delete({ path: f.file });
  }
}

export type RenameParams = { oldName: string; newName: string };
export async function rename(client: SynologyClient, params: RenameParams) {
  const { oldName, newName } = params;
  if (!client?.FileStation?.rename) throw new Error('not_supported');
  const dirname = path.dirname(oldName);
  const newPath = path.join(dirname, newName);
  return client.FileStation.rename({ path: oldName, newName: newPath });
}

export type PutFileParams = { localPath: string; prefix: string };
export async function putFile(client: SynologyClient, params: PutFileParams) {
  const { localPath, prefix } = params;
  if (!client?.FileStation?.upload) throw new Error('not_supported');
  const remotePath = path.join(prefix || '/', path.basename(localPath));
  const fileBuffer = await fs.readFile(localPath);
  return client.FileStation.upload({ path: remotePath, data: fileBuffer });
}

export type PutFolderParams = { prefix: string; localPath: string };
export async function putFolder(client: SynologyClient, params: PutFolderParams) {
  const { localPath, prefix } = params;
  if (!client?.FileStation?.createFolder) throw new Error('not_supported');
  const remoteFolderPath = path.join(prefix, path.basename(localPath));
  return client.FileStation.createFolder({ path: remoteFolderPath });
}

export type PutMultiObjectsParams = { prefix: string; localPaths: string[] };
export async function putMultiObjects(client: SynologyClient, params: PutMultiObjectsParams) {
  const { prefix, localPaths } = params;
  if (!client?.FileStation?.upload || !client?.FileStation?.createFolder) throw new Error('not_supported');
  const allLocalPaths = await readDirectoryRecursive(localPaths);
  for (const item of allLocalPaths) {
    const filePath = item.fullPath;
    if (isObjectFolder(filePath)) {
      await putFolder(client, { prefix: filePath, localPath: filePath });
    } else {
      await putFile(client, { prefix, localPath: filePath });
    }
  }
}

export type GetSourceUrlParams = {
  key: string;
  connectionId: string;
  lastModified: number;
};
export async function getSourceUrl(client: SynologyClient, _config: any, params: GetSourceUrlParams) {
  const { key, connectionId, lastModified } = params;
  const etag = getMd5ByString(`${connectionId}-${lastModified}-${key}`);
  const tmpFileName = path.join(getTempPath(), `${etag}${path.extname(key)}`);
  const filePath = `file://${tmpFileName}`;
  if (!fs.existsSync(tmpFileName)) {
    await getFile(client, { key, localFilePath: tmpFileName });
  }
  const mimeValue = mime.lookup(filePath) || '';
  return {
    src: filePath,
    mime: mimeValue,
    content: /text\/.{0,}/.test(mimeValue) ? await fs.readFile(tmpFileName, { encoding: 'utf-8' }) : '',
  };
}
