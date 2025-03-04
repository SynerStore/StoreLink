import { app } from 'electron';
import path from 'node:path';

import { isDev } from './env';
import { EPages } from '../types';

export const PACKAGE_PATH = app.isPackaged
  ? path.join(__dirname, './package.json')
  : path.join(__dirname, '../package.json');

export const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

export const ICON_PATH = path.join(RESOURCES_PATH, 'icon.png');
export const getPublicFilePath = ({ name }: { name: string }) => {
  const pathName = path.resolve(path.join(__dirname, name)).replace(/\\/g, '/');
  return encodeURI('file://' + ensureFirstBackSlash(pathName));
};

export const getPageUrl = (page: EPages) => {
  if (isDev) {
    return `http://localhost:3000/${page}.html`;
  } else {
    return getPublicFilePath({ name: `${page}.html` });
  }
};

export const ensureFirstBackSlash = (str: string) => {
  return str.length > 0 && str.charAt(0) !== '/' ? '/' + str : str;
};


export const getRcloneConfigPath = () => {
  if (process.platform === 'win32') {
    return path.join(app.getPath('home'), '.config', 'rclone', 'rclone.conf');
  } else {
    return path.join(app.getPath('home'), '.config', 'rclone', 'rclone.conf');
  }
};

export const getRcloneCMDPath = () => {
  if (process.platform === 'win32') {
   return path.join('../../../bin',  'rclone', 'rclone.conf');
  } else {
    return path.join(app.getPath('home'), '.config', 'rclone', 'rclone.conf');
  }
};