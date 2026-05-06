import { v4 as uuidv4 } from 'uuid';
import { ProgressData } from '@/main/utils';
import { ETaskStatus, ETaskType } from '@/types';
import TaskScheduler from './scheduler';

export type TaskEntityParams = {
  taskId?: string;
  parentId?: string;
  type: ETaskType;
  connectionId: string;
  method: string;
  params: any;
  size: number;
  status?: ETaskStatus;
  progress?: number;
  priority?: number;
  executionPolicy?: string;
  checkpoint?: string;
  createTime?: string;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  errorStack?: string;
};

export default class TaskEntity {
  taskId: string;
  parentId: string | undefined;
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
  priority: number;
  executionPolicy: string | undefined;
  checkpoint: string | undefined;
  errorMessage: string | undefined;
  errorStack: string | undefined;
  retryCount: number = 0;
  maxRetries: number = 3;

  private abortController: AbortController | null = null;

  onProgress?: (data: ProgressData) => void;
  onStatusChange?: (status: ETaskStatus, err?: string) => void;

  constructor(params: TaskEntityParams) {
    this.taskId = params.taskId || uuidv4();
    this.parentId = params.parentId;
    this.type = params.type;
    this.status = params.status || ETaskStatus.PENDING;
    this.connectionId = params.connectionId;
    this.method = params.method;
    this.params = params.params;
    this.progress = params.progress || 0;
    this.speed = 0;
    this.size = params.size;
    this.priority = params.priority || 0;
    this.executionPolicy = params.executionPolicy;
    this.checkpoint = params.checkpoint;
    this.createTime = params.createTime || new Date().toISOString();
    this.startTime = params.startTime;
    this.endTime = params.endTime;
    this.errorMessage = params.errorMessage;
    this.errorStack = params.errorStack;
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
    this.abortController = new AbortController();

    try {
      await TaskScheduler.getInstance().runTask(this, this.abortController.signal);

      this.status = ETaskStatus.COMPLETED;
      this.endTime = new Date().toISOString();
      this.onStatusChange?.(this.status);
    } catch (err: any) {
      if (err.name === 'AbortError' || this.status === ETaskStatus.CANCELED || this.status === ETaskStatus.PAUSED) {
        return;
      }

      console.error('Task failed:', err);

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.status = ETaskStatus.RETRYING;
        const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
        
        console.log(`Retrying task ${this.taskId} in ${delay}ms (${this.retryCount}/${this.maxRetries})...`);
        this.onStatusChange?.(this.status, `Retrying... (${this.retryCount})`);
        
        setTimeout(() => this.run(), delay);
        return;
      }

      this.status = ETaskStatus.FAILED;
      this.errorMessage = err.message || String(err);
      this.errorStack = err.stack;
      this.endTime = new Date().toISOString();
      this.onStatusChange?.(this.status, this.errorMessage);
    } finally {
      this.abortController = null;
    }
  }

  async pause() {
    if (this.status === ETaskStatus.RUNNING) {
      this.status = ETaskStatus.PAUSED;
      this.abortController?.abort();
      this.onStatusChange?.(this.status);
    }
  }

  async resume() {
    if (this.status === ETaskStatus.PAUSED || this.status === ETaskStatus.FAILED || this.status === ETaskStatus.PENDING) {
      await this.run();
    }
  }

  async cancel() {
    this.status = ETaskStatus.CANCELED;
    this.abortController?.abort();
    this.endTime = new Date().toISOString();
    this.onStatusChange?.(this.status);
  }

  toRow() {
    return {
      taskId: this.taskId,
      parentId: this.parentId ?? null,
      type: this.type,
      connectionId: this.connectionId,
      method: this.method,
      params: JSON.stringify(this.params) ?? '{}',
      status: this.status,
      progress: this.progress,
      speed: this.speed,
      size: this.size ?? 0,
      priority: this.priority,
      executionPolicy: this.executionPolicy ?? null,
      checkpoint: this.checkpoint ?? null,
      startTime: this.startTime ?? null,
      endTime: this.endTime ?? null,
      createTime: this.createTime,
      errorMessage: this.errorMessage ?? null,
      errorStack: this.errorStack ?? null,
    };
  }
}
