import { v4 as uuidv4 } from 'uuid';

import { getStoreInstance } from '@/main/stores';
import { ProgressData } from '@/main/utils';

export enum ETaskStatus {
  PENDING = 'pending',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

export enum ETaskType {
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  DELETE = 'delete',
  RENAME = 'rename',
}

export type TaskEntityParams = {
  type: ETaskType;
  connectionId: string;
  method: string;
  params: any;
  size: number;
};

export default class TaskEntity {
  taskId: string;
  type: ETaskType;
  connectionId: string;
  method: string;
  params: any;
  status: ETaskStatus;
  progress: number;
  speed: number;
  startTime: string | undefined;
  endTime: string | undefined;
  createTime: string;
  size: number;
  constructor(params: TaskEntityParams) {
    this.taskId = uuidv4();
    this.type = params.type;
    this.status = ETaskStatus.PENDING;
    this.connectionId = params.connectionId;
    this.method = params.method;
    this.progress = 0;
    this.speed = 0;
    this.size = params.size;
    this.createTime = new Date().toISOString();
  }

  async run() {
    const { connectionId, method, params } = this;
    const store = getStoreInstance(connectionId);
    try {
      await store[method](params, (data: ProgressData) => {
        console.log('进度', data.progress);
      });
    } catch (err) {
      console.log(err);
      this.status = ETaskStatus.FAILED;
    }
  }

  async retry() {
    this.status = ETaskStatus.PENDING;
    await this.run();
  }

  async cancel() {
    this.status = ETaskStatus.CANCELED;
  }

  // 从持久化数据中恢复任务
  // async recover() {
  //   this.status = ETaskStatus.PENDING;
  //   this.taskId =
  // }

  // 归档持久化存储
  archive() {
    return {
      taskId: this.taskId,
      status: this.status,
      progress: this.progress,
      speed: this.speed,
      size: this.size,
      type: this.type,
    };
  }
}
