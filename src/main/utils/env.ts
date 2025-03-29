import { default as isDevelopment } from 'electron-is-dev';
import os from 'node:os';

export const isDev = isDevelopment;

export function isInWin() {
  return os.platform() === 'win32';
}

export function isInMac() {
  return os.platform() === 'darwin';
}

export function isInLinux() {
  return os.platform() === 'linux';
}
