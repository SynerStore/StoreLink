import { parentPort, MessagePort } from 'worker_threads';
import path from 'node:path';
import S3Store from '../stores/adapters/s3';
import LocalStore from '../stores/adapters/local';
import OssStore from '../stores/adapters/oss';
import CosStore from '../stores/adapters/cos';
import WebDAVStore from '../stores/adapters/webdev';
import SftpStore from '../stores/adapters/sftp';
import SynologyStore from '../stores/adapters/synology';
import { StoreTypes } from '@/types';

interface WorkerTask {
  taskId: string;
  type: string;
  connectionId: string;
  method: string;
  params: any;
  config: any;
  storeType: string;
  port?: MessagePort;
}

const createStoreClient = (storeType: string, id: string, config: any) => {
  switch (storeType) {
    case StoreTypes.OSS:
      return new OssStore(id, config);
    case StoreTypes.COS:
      return new CosStore(id, config);
    case StoreTypes.S3:
      return new S3Store(id, config);
    case StoreTypes.LOCAL:
      return new LocalStore(id, config);
    case StoreTypes.SFTP:
      return new SftpStore(id, config);
    case StoreTypes.WEBDAV:
      return new WebDAVStore(id, config);
    case StoreTypes.SYNOLOGY:
      return new SynologyStore(id, config);
    default:
      return null;
  }
};

const handleTransfer = async (task: WorkerTask, store: any, onProgress: (data: any) => void) => {
  const { params } = task;
  const { files, targetPath, isMove } = params;
  const size = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = path.basename(file);
    const destPath = path.join(targetPath, fileName);

    if (isMove) {
      // Note: Store adapters must support these params.
      // If S3 expects oldKey/newKey, this might need adaptation or caller ensures params match.
      // We keep existing logic from TaskEntity.
      await store.rename({
        oldName: file,
        newName: destPath,
        oldKey: file,
        newKey: destPath,
      });
    } else {
      await store.copy({
        file: file,
        newFile: destPath,
        sourceKey: file,
        targetKey: destPath,
        targetPath: targetPath,
      });
    }

    onProgress({
      receivedBytes: i + 1,
      size: size,
      progress: Math.round(((i + 1) / size) * 100),
      speed: 0,
    });
  }
  return { success: true };
};

export default async function (task: WorkerTask) {
  const { taskId, connectionId, method, params, config, storeType, type } = task;

  const store: any = createStoreClient(storeType, connectionId, config);
  if (!store) {
    throw new Error(`Unsupported store type: ${storeType}`);
  }

  try {
    let lastTime = 0;
    let lastProgress = -1;

    const onProgress = (data: any) => {
      const now = Date.now();
      const progress = data.progress || 0;
      const isFinished = progress === 100 || data.status === 'finished' || data.status === 'completed';
      const isStarted = progress === 0 && lastProgress === -1;
      const timeElapsed = now - lastTime > 500;
      const progressJump = Math.abs(progress - lastProgress) >= 1;

      if (isFinished || isStarted || timeElapsed || progressJump) {
        if (task.port) {
          task.port.postMessage({
            taskId,
            type: 'progress',
            data,
          });
        } else {
          parentPort?.postMessage({
            taskId,
            type: 'progress',
            data,
          });
        }
        lastTime = now;
        lastProgress = progress;
      }
    };

    if (type === 'transfer') {
      const result = await handleTransfer(task, store, onProgress);
      if (store.destroy && typeof store.destroy === 'function') {
        store.destroy();
      }
      return result;
    }

    if (typeof store[method] !== 'function') {
      throw new Error(`Method ${method} not found in store`);
    }

    const result = await store[method](params, onProgress);

    if (store.destroy && typeof store.destroy === 'function') {
      store.destroy();
    }

    return result;
  } catch (err: any) {
    if (store.destroy && typeof store.destroy === 'function') {
      store.destroy();
    }
    throw err;
  }
}
