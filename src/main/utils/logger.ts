import log from 'electron-log/main';
import path from 'path';
import fs from 'fs-extra';
import dayjs from 'dayjs';
import { getUserDataPath } from './path';

const LOG_DIR = path.join(getUserDataPath(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'app.error.log');

fs.ensureDirSync(LOG_DIR);

// Create error logger instance
export const errorLogger = log.create({ logId: 'error' });

function rotateLog(filePath: string, kind: 'normal' | 'error') {
  try {
    if (!fs.existsSync(filePath)) return;
    
    const stat = fs.statSync(filePath);
    const fileDate = dayjs(stat.mtime).format('YYYY-MM-DD');
    const today = dayjs().format('YYYY-MM-DD');
    
    if (fileDate !== today) {
      const archiveName = kind === 'error' ? `${fileDate}.error.log` : `${fileDate}.log`;
      const archivePath = path.join(LOG_DIR, archiveName);
      
      if (!fs.existsSync(archivePath)) {
        fs.renameSync(filePath, archivePath);
      } else {
        const content = fs.readFileSync(filePath);
        fs.appendFileSync(archivePath, content);
        fs.unlinkSync(filePath);
      }
    }
  } catch (e) {
    console.error('Log rotation failed:', e);
  }
}

rotateLog(LOG_FILE, 'normal');
rotateLog(ERROR_LOG_FILE, 'error');

// Configure main logger
// @ts-ignore
if (log.transports?.file?.resolvePathFn) {
  // @ts-ignore
  log.transports.file.resolvePathFn = () => LOG_FILE;
} else {
  // @ts-ignore
  log.transports.file.resolvePath = () => LOG_FILE;
}

// Configure error logger
// @ts-ignore
if (errorLogger.transports?.file?.resolvePathFn) {
  // @ts-ignore
  errorLogger.transports.file.resolvePathFn = () => ERROR_LOG_FILE;
} else {
  // @ts-ignore
  errorLogger.transports.file.resolvePath = () => ERROR_LOG_FILE;
}

// Disable console output for error logger
// @ts-ignore
if (errorLogger.transports?.console) {
  // @ts-ignore
  errorLogger.transports.console.level = false;
}

log.initialize({ preload: true });

export const logger = log;
