import path from 'node:path';
import fs from 'fs-extra';
import dayjs from 'dayjs';
import { getUserDataPath, logger, errorLogger } from '@/main/utils';

const LOG_DIR = path.join(getUserDataPath(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

fs.ensureDirSync(LOG_DIR);

export function logAction(params: { action: string; message?: string; meta?: any; level?: 'info' | 'warn' | 'error' }) {
  const { action, message = '', meta = {}, level = 'info' } = params || {};
  const text = `[ACTION] ${action} ${message} ${JSON.stringify(meta)}`;
  switch (level) {
    case 'error':
      logger.error(text);
      errorLogger.error(text);
      break;
    case 'warn':
      logger.warn(text);
      break;
    default:
      logger.info(text);
  }
  return true;
}

export async function getLogs(params: { date?: string; page?: number; pageSize?: number; kind?: 'normal' | 'error' }) {
  const { date, page = 1, pageSize = 200, kind = 'normal' } = params || {};
  
  let targetFile = LOG_FILE;
  if (date) {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const todayStr = dayjs().format('YYYY-MM-DD');
    if (dateStr !== todayStr) {
      const archivePath = path.join(LOG_DIR, kind === 'error' ? `${dateStr}.error.log` : `${dateStr}.log`);
      if (fs.existsSync(archivePath)) {
        targetFile = archivePath;
      }
    } else if (kind === 'error') {
      const errorToday = path.join(LOG_DIR, 'app.error.log');
      if (fs.existsSync(errorToday)) {
        targetFile = errorToday;
      }
    }
  }

  try {
    if (!fs.existsSync(targetFile)) {
      if (targetFile !== LOG_FILE && fs.existsSync(LOG_FILE)) {
        targetFile = LOG_FILE;
      } else {
        return { lines: [], total: 0, page, pageSize };
      }
    }

    const content = await fs.readFile(targetFile, 'utf-8');
    let lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const total = lines.length;
    const start = Math.max(0, total - page * pageSize);
    const end = Math.max(0, total - (page - 1) * pageSize);
    const paged = lines.slice(start, end);
    return { lines: paged, total, page, pageSize };
  } catch {
    return { lines: [], total: 0, page, pageSize };
  }
}
