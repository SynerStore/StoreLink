import path from 'node:path';
import os from 'node:os';
import qs from 'query-string';
import fs from 'node:fs';

import { isEmpty } from './helpers';
import { isDev } from './env';
import { EPages } from '../../types';

let app: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  app = require('electron').app;
} catch (e) {
  // ignore
}

const isPackaged = app ? app.isPackaged : process.env.NODE_ENV === 'production';

// 资源路径
export const PACKAGE_PATH = isPackaged
  ? path.join(__dirname, './package.json')
  : path.join(__dirname, '../package.json');

export const RESOURCES_PATH = isPackaged && app
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

export const ICON_PATH = path.join(RESOURCES_PATH, 'icon.png');

export const getPublicFilePath = ({ name }: { name: string }) => {
  const pathName = path.resolve(path.join(__dirname, name)).replace(/\\/g, '/');
  return encodeURI('file://' + ensureFirstBackSlash(pathName));
};

export const getPageUrl = (page: EPages, query: Record<string, any> = {}) => {
  let url;
  if (isDev) {
    url = `http://localhost:3099/${page}.html`;
  } else {
    url = getPublicFilePath({ name: `${page}.html` });
  }
  return url + (isEmpty(query) ? '' : `?${qs.stringify(query)}`);
};

// rclone 路径
export const ensureFirstBackSlash = (str: string) => {
  return str.length > 0 && str.charAt(0) !== '/' ? '/' + str : str;
};

export const getRcloneConfigPath = () => {
  const home = app ? app.getPath('home') : os.homedir();
  if (process.platform === 'win32') {
    return path.join(home, '.config', 'rclone', 'rclone.conf');
  } else {
    return path.join(home, '.config', 'rclone', 'rclone.conf');
  }
};

export const getRcloneCMDPath = () => {
  if (process.platform === 'win32') {
    return path.join('../../../bin', 'rclone', 'rclone.conf');
  } else {
    const home = app ? app.getPath('home') : os.homedir();
    return path.join(home, '.config', 'rclone', 'rclone.conf');
  }
};

// 应用程序相关路径
export const getUserDataPath = () => {
  const userDataPath = app ? app.getPath('userData') : path.join(os.homedir(), '.synerstore');
  // 开发环境用户数据
  if (isDev) {
    const devDataPath = path.join(__dirname, '../.userdata');
    return devDataPath;
  }
  return userDataPath;
};

export const getHomePath = () => {
  return app ? app.getPath('home') : os.homedir();
};

export const getTempPath = () => {
  const temppath =  app ? app.getPath('temp') : os.tmpdir();
   const appTempPath = path.join(temppath, 'store-link');
   if (!fs.existsSync(appTempPath)) {
    fs.mkdirSync(appTempPath);
   }
   return appTempPath;
};

export const getDownloadsPath = () => {
  return app ? app.getPath('downloads') : path.join(os.homedir(), 'Downloads');
};

export const getLogsPath = () => {
  return app ? app.getPath('logs') : path.join(getUserDataPath(), 'logs');
};
