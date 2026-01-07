import logger from 'electron-log';
import path from 'node:path';
import fs from 'fs-extra';
import { getUserDataPath } from '@/main/utils';

const LOG_DIR = path.join(getUserDataPath(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

fs.ensureDirSync(LOG_DIR);
// adapt to electron-log v4/v5
// @ts-ignore
if (logger.transports?.file?.resolvePathFn) {
  // @ts-ignore
  logger.transports.file.resolvePathFn = () => LOG_FILE;
} else {
  // @ts-ignore
  logger.transports.file.resolvePath = () => LOG_FILE;
}

export function logAction(params: { action: string; message?: string; meta?: any; level?: 'info' | 'warn' | 'error' }) {
  const { action, message = '', meta = {}, level = 'info' } = params || {};
  const text = `[ACTION] ${action} ${message} ${JSON.stringify(meta)}`;
  switch (level) {
    case 'error':
      logger.error(text);
      break;
    case 'warn':
      logger.warn(text);
      break;
    default:
      logger.info(text);
  }
  return true;
}

export async function getLogs(params: { date?: string; limit?: number }) {
  const { date, limit = 200 } = params || {};
  try {
    const content = await fs.readFile(LOG_FILE, 'utf-8');
    let lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (date) {
      lines = lines.filter((l) => l.includes(date));
    }
    const tail = lines.slice(Math.max(0, lines.length - limit));
    return tail;
  } catch {
    return [];
  }
}
