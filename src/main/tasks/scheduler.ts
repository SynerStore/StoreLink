import Piscina from 'piscina';
import path from 'path';
import { MessageChannel } from 'worker_threads';
import TaskEntity from './entity';
import { getStoreConfig } from '../stores/storeManage';
import { ETaskStatus } from '@/types';
import db from '@/main/db/sqlite';
import { logger } from '../utils/logger';
// Use require to avoid circular dependency issues at module level if TaskManager imports Scheduler
// But we will import type for TS
import type TaskManager from './manage';

export class TaskScheduler {
  private static instance: TaskScheduler;
  private piscina: Piscina;
  private logger = logger.scope('TaskScheduler');

  private constructor() {
    // Determine worker path.
    // In production (bundled), __dirname is where main.js is.
    // storage.worker.js should be in the same directory.
    const workerPath = path.resolve(__dirname, 'storage.worker.js');

    this.piscina = new Piscina({
      filename: workerPath,
      maxThreads: 5,
      idleTimeout: 30000 // Worker idle timeout
    });

    this.startPolling();
  }

  public static getInstance(): TaskScheduler {
    if (!TaskScheduler.instance) {
      TaskScheduler.instance = new TaskScheduler();
    }
    return TaskScheduler.instance;
  }

  async runTask(task: TaskEntity) {
    const configData = getStoreConfig(task.connectionId);
    if (!configData) {
      throw new Error(`Connection config not found for ${task.connectionId}`);
    }

    const { port1, port2 } = new MessageChannel();

    // Listen for progress events from worker
    port2.on('message', (msg) => {
      if (msg.type === 'progress') {
        task.onProgress?.(msg.data);
      }
    });

    const workerTask = {
      taskId: task.taskId,
      type: task.type,
      connectionId: task.connectionId,
      method: task.method,
      params: task.params,
      config: configData.config,
      storeType: configData.type,
      port: port1
    };

    try {
      // Transfer port1 to worker
      const result = await this.piscina.run(workerTask, { transferList: [port1] as any });
      port2.close();
      return result;
    } catch (err) {
      port2.close();
      throw err;
    }
  }

  /**
   * Execute a task directly in worker without DB persistence
   */
  async executeWorkerTask(options: {
    connectionId: string;
    method: string;
    params: any;
  }) {
    const { connectionId, method, params } = options;
    const configData = getStoreConfig(connectionId);
    if (!configData) {
      throw new Error(`Connection config not found for ${connectionId}`);
    }

    const start = Date.now();
    const workerTask = {
      taskId: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'execution',
      connectionId,
      method,
      params,
      config: configData.config,
      storeType: configData.type,
    };

    try {
      const result = await this.piscina.run(workerTask);
      this.logger.info(`Execute worker task ${method} for ${connectionId} took ${Date.now() - start}ms`);
      return result;
    } catch (err: any) {
      this.logger.error(`Execute worker task ${method} failed:`, err);
      throw err;
    }
  }

  private startPolling() {
    // Poll every 2 seconds
    setInterval(() => this.poll(), 2000);
  }

  private async poll() {
    // If queue is full, skip
    if (this.piscina.queueSize >= 5) return;

    try {
      // Find pending tasks
      // We limit to 5 to avoid fetching too many
      const rows = db.prepare(`
        SELECT * FROM tasks
        WHERE status = ?
        ORDER BY createTime ASC
        LIMIT 5
      `).all(ETaskStatus.PENDING) as any[];

      if (rows.length === 0) return;

      // We need TaskManager to get or create the task entity
      // Dynamically require to avoid circular dependency loop during initialization
      const { default: TaskManagerClass } = require('./manage');
      const taskManager = TaskManagerClass.getInstance() as TaskManager;

      for (const row of rows) {
        let task = taskManager.getTaskById(row.taskId);

        if (!task) {
            // If task not in memory, restore it
            task = taskManager.restoreTask(row);
        }

        if (task && task.status === ETaskStatus.PENDING) {
          // Check if already running in scheduler?
          // TaskEntity.run() sets status to RUNNING immediately.
          // So if we are here, it is PENDING.
          // Calling task.run() will trigger scheduler.runTask()
          task.run().catch((err: any) => {
             console.error(`Failed to start polled task ${task.taskId}:`, err);
          });
        }
      }
    } catch (err) {
      console.error('Task polling error:', err);
    }
  }

  public getStats() {
    return {
      queueSize: this.piscina.queueSize,
      utilization: this.piscina.utilization,
      completed: this.piscina.completed,
      runTime: this.piscina.duration
    };
  }
}

export default TaskScheduler;
