import { pipeline } from 'stream';
import { promisify } from 'util';
import _ from 'lodash';

// 文件流式下载监听
export type ProgressData = {
  speed: number;
  progress: number;
  receivedBytes: number;
  size: number;
};
export const streamOnProgress = (readerStream: any, writerStream: any, size: number, onProgress: any) => {
  let receivedBytes = 0;
  let startTime = Date.now();

  readerStream.on('data', (chunk: any) => {
    receivedBytes += chunk.length;
    const elapsed = (Date.now() - startTime) / 1000; // 已用时间（秒）
    const speed = (receivedBytes / 1024 / 1024 / elapsed).toFixed(2); // MB/s
    const progress = (receivedBytes / size) * 100;

    console.log(`进度: ${progress.toFixed(1)}%`);
    console.log(`实时速度: ${speed} MB/s`);
    if (onProgress) {
      onProgress({
        progress: progress,
        speed: speed,
        status: 'running',
      });
    }
  });
  // 完成监听
  writerStream.on('finish', () => {
    if (onProgress) {
      onProgress({
        progress: 100,
        speed: 0,
        status: 'finished',
      });
    }
  });

  // 错误处理
  writerStream.on('error', (_err: any) => {
    console.log('下载失败', _err.message);
    if (onProgress) {
      onProgress({
        progress: 100,
        speed: 0,
        status: 'failed',
      });
    }
  });
};

/**
 * 流式传输 Promise 封装
 */
export function streamToPromise(readStream: any, writerStream: any) {
  // 使用 Node.js 内置的 pipeline（推荐方案）
  const pipelinePromise = promisify(pipeline);
  return pipelinePromise(readStream, writerStream);
}
