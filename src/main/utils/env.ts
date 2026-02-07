import os from 'node:os';

let isDevVal = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const electron = require('electron');

  // Check if running in a valid Electron environment (Main Process)
  // If 'electron' is a string, it means we are in a regular Node process (e.g. Worker Thread)
  // where the 'electron' npm package exports the executable path.
  // In this case, 'electron-is-dev' would throw "Not running in an Electron environment!"
  if (typeof electron !== 'string') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const isDevelopment = require('electron-is-dev');
    // Handle ES Module default export if necessary
    isDevVal = typeof isDevelopment === 'boolean' ? isDevelopment : (isDevelopment.default ?? false);
  } else {
    // Fallback for Worker Threads
    isDevVal = process.env.NODE_ENV === 'development';
  }
} catch (e) {
  // Fallback on any error (e.g. module not found)
  isDevVal = process.env.NODE_ENV === 'development';
}

export const isDev = isDevVal;

export function isInWin() {
  return os.platform() === 'win32';
}

export function isInMac() {
  return os.platform() === 'darwin';
}

export function isInLinux() {
  return os.platform() === 'linux';
}
