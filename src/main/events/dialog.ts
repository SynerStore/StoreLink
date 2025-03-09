import { dialog, OpenDialogOptions } from 'electron';
import _ from 'lodash';

import { getDownloadsPath } from '../utils';

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
