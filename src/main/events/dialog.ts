import { BrowserWindow, clipboard, dialog, OpenDialogOptions } from 'electron';
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'node:path';
import crypto from 'node:crypto';

import { getDownloadsPath, getTempPath } from '../utils';

export const getFilePath = async (options: OpenDialogOptions = {}) => {
  const downloadPath = getDownloadsPath();
  return dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory', 'createDirectory'],
    defaultPath: downloadPath,
    ...options,
  });
};

export const getSingleFilePath = async (options: OpenDialogOptions = {}) => {
  const downloadPath = getDownloadsPath();
  const result = await dialog.showOpenDialog({
    defaultPath: downloadPath,
    ...options,
    properties: ['openFile', 'showHiddenFiles'],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
};

export const getSingleDirPath = async (options: OpenDialogOptions = {}) => {
  const downloadPath = getDownloadsPath();
  const result = await dialog.showOpenDialog({
    defaultPath: downloadPath,
    ...options,
    properties: ['openDirectory'],
  });
  if (result.canceled) {
    return null;
  }
  return result.filePaths[0];
};

export const getMultDirAndFilePath = async (options: OpenDialogOptions = {}) => {
  const downloadPath = getDownloadsPath();
  const result = await dialog.showOpenDialog({
    defaultPath: downloadPath,
    ...options,
    properties: ['openFile', 'openDirectory', 'multiSelections', 'showHiddenFiles'],
  });
  if (result.canceled) {
    return null;
  }
  return result.filePaths;
};

export type WriteTempFileParams = {
  fileName?: string;
  bytes: ArrayBuffer | Uint8Array | number[];
  dirName?: string;
};

export const writeTempFile = async (params: WriteTempFileParams) => {
  const rawName = typeof params?.fileName === 'string' ? params.fileName.trim() : '';
  const baseName = path.basename(rawName || 'clipboard');
  const safeBaseName = baseName.replace(/[\\/:*?"<>|]/g, '_').trim() || 'clipboard';

  const ext = path.extname(safeBaseName);
  const stem = ext ? safeBaseName.slice(0, -ext.length) : safeBaseName;
  const unique = crypto.randomBytes(6).toString('hex');
  const finalName = `${stem || 'clipboard'}-${Date.now()}-${unique}${ext || ''}`;

  const dir = path.join(getTempPath(), 'StoreLink', params?.dirName || 'clipboard');
  await fs.ensureDir(dir);

  const bytes: any = params?.bytes;
  const buffer = Buffer.isBuffer(bytes)
    ? bytes
    : bytes instanceof Uint8Array
      ? Buffer.from(bytes)
      : bytes instanceof ArrayBuffer
        ? Buffer.from(new Uint8Array(bytes))
        : Array.isArray(bytes)
          ? Buffer.from(bytes)
          : Buffer.from([]);

  const fullPath = path.join(dir, finalName);
  await fs.writeFile(fullPath, buffer);
  return fullPath;
};

export const getClipboardFilePaths = async () => {
  const formats = clipboard.availableFormats();
  const read = (format: string) => {
    try {
      const v = clipboard.read(format);
      return typeof v === 'string' ? v : '';
    } catch (_e) {
      return '';
    }
  };

  const raw =
    (formats.includes('text/uri-list') ? read('text/uri-list') : '') ||
    (formats.includes('public.file-url') ? read('public.file-url') : '') ||
    clipboard.readText();

  const lines = (raw || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('#'));

  const paths: string[] = [];
  for (const line of lines) {
    if (!line.startsWith('file://')) continue;
    try {
      const url = new URL(line);
      let p = decodeURIComponent(url.pathname);
      if (/^\/[A-Za-z]:\//.test(p)) p = p.slice(1);
      if (p) paths.push(p);
    } catch (_e) {}
  }

  return Array.from(new Set(paths));
};

/**
 * 用于保存文件到本地
 */
export const saveFileToLocal = async (
  win: BrowserWindow,
  options: OpenDialogOptions & { fileName: string; payload: string },
) => {
  const downloadPath = getDownloadsPath();
  const result = await dialog.showSaveDialog(win, {
    ..._.omit(options, ['defaultPath', 'fileName']),
    defaultPath: options.defaultPath || `${downloadPath}/${options.fileName}`,
    properties: ['createDirectory', 'showOverwriteConfirmation'],
  });

  if (!result.canceled && result.filePath) {
    return result.filePath;
  } else {
    return null;
  }
};
