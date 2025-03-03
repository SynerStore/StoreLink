import { default as isDevelopment } from 'electron-is-dev';
import os from 'node:os';

export const isDev = isDevelopment;

// 判断是否是在win中
export function isInWin() {
  return os.platform() === 'win32';
}

// 是否是在mac
export function isInMac() {
  return os.platform() === 'darwin';
}
