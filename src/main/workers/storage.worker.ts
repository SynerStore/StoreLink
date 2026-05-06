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
import type { IStorageHandler } from '../stores/adapters/store';

interface WorkerTask {
  taskId: string;
  type: string;
  connectionId: string;
  method: string;
  params: any;
  config: any;
  storeType: string;
  port?: MessagePort;
  
  // For cross-store transfers
  sourceConfig?: any;
  sourceStoreType?: string;
}

const createStoreClient = (storeType: string, id: string, config: any): IStorageHandler | null => {
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

const handleTransfer = async (task: WorkerTask, store: IStorageHandler, onProgress: (data: any) => void, abortSignal?: AbortSignal) => {
  const { params, sourceConfig, sourceStoreType } = task;
  const { files, targetPath, isMove } = params;
  
  // If it's a cross-store transfer (has sourceConfig)
  if (sourceConfig && sourceStoreType) {
    const sourceStore = createStoreClient(sourceStoreType, 'source', sourceConfig);
    if (!sourceStore) throw new Error(`Unsupported source store type: ${sourceStoreType}`);
    
    try {
      // For now, assume single file transfer for cross-store stream
      // Multiple files should be split into multiple tasks by TaskManager (Scheme B)
      const { sourceKey, targetKey, size } = params;
      
      if (sourceStore.getReadStream && store.putWriteStream) {
        const reader = await sourceStore.getReadStream({ key: sourceKey });
        await store.putWriteStream({ key: targetKey, size }, reader, onProgress);
        return { success: true };
      } else if (sourceStore.get && store.put) {
        // Fallback to traditional get/put if streaming not supported
        const { data: buffer } = await sourceStore.get({ key: sourceKey });
        await store.put({ key: targetKey, data: buffer }, onProgress);
        return { success: true };
      } else {
        throw new Error('Store does not support required methods for cross-store transfer');
      }
    } finally {
      if (sourceStore.destroy) sourceStore.destroy();
    }
  }

  // Same-store transfer (Copy/Move)
  const size = files?.length || 0;
  for (let i = 0; i < size; i++) {
    if (abortSignal?.aborted) throw new Error('Aborted');
    
    const file = files[i];
    const fileName = path.basename(file);
    const destPath = path.join(targetPath, fileName);

    if (isMove) {
      if (!store.rename) throw new Error('Store does not support rename operation');
      await store.rename({
        oldName: file,
        newName: destPath,
        oldKey: file,
        newKey: destPath,
      });
    } else {
      if (!store.copy) throw new Error('Store does not support copy operation');
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
  const { taskId, connectionId, method, params, config, storeType, type, port } = task;

  const store = createStoreClient(storeType, connectionId, config);
  if (!store) {
    throw new Error(`Unsupported store type: ${storeType}`);
  }

  const abortController = new AbortController();
  if (port) {
    port.on('message', (msg) => {
      if (msg.type === 'abort') {
        abortController.abort();
      }
    });
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
        const payload = {
          taskId,
          type: 'progress',
          data,
        };
        if (port) {
          port.postMessage(payload);
        } else {
          parentPort?.postMessage(payload);
        }
        lastTime = now;
        lastProgress = progress;
      }
    };

    if (type === 'transfer') {
      const result = await handleTransfer(task, store, onProgress, abortController.signal);
      return result;
    }

    const methodHandler = (store as any)[method];
    if (typeof methodHandler !== 'function') {
      throw new Error(`Method ${method} not found in store`);
    }

    // Pass abort signal to store methods if they support it
    const result = await methodHandler(params, onProgress, abortController.signal);
    return result;
  } catch (err: any) {
    throw err;
  } finally {
    if (store.destroy && typeof store.destroy === 'function') {
      store.destroy();
    }
  }
}
