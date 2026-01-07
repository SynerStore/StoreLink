import { v4 as uuidv4 } from 'uuid';
import { getStoreInstance } from '@/main/stores';
import { ProgressData } from '@/main/utils';
import { ETaskStatus, ETaskType } from '@/types';

export type TaskEntityParams = {
  taskId?: string;
  type: ETaskType;
  connectionId: string;
  method: string;
  params: any;
  size: number;
  status?: ETaskStatus;
  progress?: number;
  createTime?: string;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
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
  errorMessage: string | undefined;

  onProgress?: (data: ProgressData) => void;
  onStatusChange?: (status: ETaskStatus, err?: string) => void;

  constructor(params: TaskEntityParams) {
    this.taskId = params.taskId || uuidv4();
    this.type = params.type;
    this.status = params.status || ETaskStatus.PENDING;
    this.connectionId = params.connectionId;
    this.method = params.method;
    this.params = params.params;
    this.progress = params.progress || 0;
    this.speed = 0;
    this.size = params.size;
    this.createTime = params.createTime || new Date().toISOString();
    this.startTime = params.startTime;
    this.endTime = params.endTime;
    this.errorMessage = params.errorMessage;
  }

  setCallbacks(onProgress: (data: ProgressData) => void, onStatusChange: (status: ETaskStatus, err?: string) => void) {
    this.onProgress = onProgress;
    this.onStatusChange = onStatusChange;
  }

  async run() {
    if (this.status === ETaskStatus.COMPLETED || this.status === ETaskStatus.CANCELED) {
      return;
    }

    this.status = ETaskStatus.RUNNING;
    this.startTime = new Date().toISOString();
    this.onStatusChange?.(this.status);

    const { connectionId, method, params } = this;
    const store = getStoreInstance(connectionId);

    try {
      await store[method](params, (data: ProgressData) => {
        this.progress = data.progress;
        this.speed = data.speed || 0;
        this.onProgress?.(data);
      });
      this.status = ETaskStatus.COMPLETED;
      this.endTime = new Date().toISOString();
      this.onStatusChange?.(this.status);
    } catch (err: any) {
      console.error('Task failed:', err);
      this.status = ETaskStatus.FAILED;
      this.errorMessage = err.message || String(err);
      this.endTime = new Date().toISOString();
      this.onStatusChange?.(this.status, this.errorMessage);
    }
  }

  async pause() {
    if (this.status === ETaskStatus.RUNNING) {
      this.status = ETaskStatus.PAUSED;
      this.onStatusChange?.(this.status);
      // Note: Actual interruption depends on store implementation support
    }
  }

  async resume() {
    if (this.status === ETaskStatus.PAUSED || this.status === ETaskStatus.FAILED) {
      await this.run();
    }
  }

  async cancel() {
    this.status = ETaskStatus.CANCELED;
    this.endTime = new Date().toISOString();
    this.onStatusChange?.(this.status);
  }

  toRow() {
    return {
      taskId: this.taskId,
      type: this.type,
      connectionId: this.connectionId,
      method: this.method,
      params: JSON.stringify(this.params) ?? '{}',
      status: this.status,
      progress: this.progress,
      speed: this.speed,
      size: this.size ?? 0,
      startTime: this.startTime ?? null,
      endTime: this.endTime ?? null,
      createTime: this.createTime,
      errorMessage: this.errorMessage ?? null
    };
  }
}
