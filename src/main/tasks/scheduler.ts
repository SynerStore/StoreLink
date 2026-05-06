import Piscina from 'piscina';
import path from 'path';
import { MessageChannel } from 'worker_threads';
import { EventEmitter } from 'events';
import TaskEntity from './entity';
import { getStoreConfig } from '../stores/storeManage';
import { ETaskStatus } from '@/types';
import db from '@/main/db/sqlite';
import { logger } from '../utils/logger';

import type TaskManager from './manage';

export class TaskScheduler extends EventEmitter {
  private static instance: TaskScheduler;
  private piscina: Piscina;
  private logger = logger.scope('TaskScheduler');
  
  private activeTasksByConnection: Map<string, number> = new Map();
  private maxTasksPerConnection = 3;
  private maxGlobalThreads = 5;
  private isScheduling = false;

  private constructor() {
    super();
    // In production (bundled), __dirname is where main.js is.
    // storage.worker.js should be in the same directory.
    const workerPath = path.resolve(__dirname, 'storage.worker.js');

    this.piscina = new Piscina({
      filename: workerPath,
      maxThreads: this.maxGlobalThreads,
      idleTimeout: 30000 // Worker idle timeout
    });

    // Trigger scheduling when a new task is added or a worker becomes free
    this.on('schedule', () => this.schedule());
    
    // Initial schedule check
    setTimeout(() => this.emit('schedule'), 1000);
  }

  public static getInstance(): TaskScheduler {
    if (!TaskScheduler.instance) {
      TaskScheduler.instance = new TaskScheduler();
    }
    return TaskScheduler.instance;
  }

  async runTask(task: TaskEntity, signal?: AbortSignal) {
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

    // Increment active tasks for this connection
    const currentActive = this.activeTasksByConnection.get(task.connectionId) || 0;
    this.activeTasksByConnection.set(task.connectionId, currentActive + 1);

    try {
      // Pass signal to piscina if supported or handle it here
      const resultPromise = this.piscina.run(workerTask, { transferList: [port1] as any });
      
      if (signal) {
        if (signal.aborted) {
          port1.postMessage({ type: 'abort' });
        } else {
          signal.addEventListener('abort', () => {
            port1.postMessage({ type: 'abort' });
          });
        }
      }

      const result = await resultPromise;
      return result;
    } finally {
      port2.close();
      const afterActive = (this.activeTasksByConnection.get(task.connectionId) || 1) - 1;
      this.activeTasksByConnection.set(task.connectionId, afterActive);
      // Trigger scheduling to fill the gap
      this.emit('schedule');
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

  private async schedule() {
    if (this.isScheduling) return;
    this.isScheduling = true;

    try {
      while (this.piscina.queueSize < this.maxGlobalThreads) {
        // Find pending tasks, prioritized
        const rows = db.prepare(`
          SELECT * FROM tasks
          WHERE status = ?
          ORDER BY priority DESC, createTime ASC
          LIMIT 20
        `).all(ETaskStatus.PENDING) as any[];

        if (rows.length === 0) break;

        const { default: TaskManagerClass } = require('./manage');
        const taskManager = TaskManagerClass.getInstance() as TaskManager;

        let startedAny = false;
        for (const row of rows) {
          const activeCount = this.activeTasksByConnection.get(row.connectionId) || 0;
          if (activeCount >= this.maxTasksPerConnection) {
            continue;
          }

          let task = taskManager.getTaskById(row.taskId);
          if (!task) {
            task = taskManager.restoreTask(row);
          }

          if (task && task.status === ETaskStatus.PENDING) {
            startedAny = true;
            task.run().catch((err: any) => {
              this.logger.error(`Failed to start task ${task.taskId}:`, err);
            });
            
            // If we hit global limit, stop picking for this loop
            if (this.piscina.queueSize >= this.maxGlobalThreads) break;
          }
        }

        if (!startedAny) break; // No more tasks can be started due to connection limits
      }
    } catch (err) {
      this.logger.error('Scheduling error:', err);
    } finally {
      this.isScheduling = false;
    }
  }

  public getStats() {
    return {
      queueSize: this.piscina.queueSize,
      utilization: this.piscina.utilization,
      completed: this.piscina.completed,
      runTime: this.piscina.duration,
      activeConnections: Array.from(this.activeTasksByConnection.entries())
        .filter(([_, count]) => count > 0)
        .map(([id, count]) => ({ connectionId: id, activeTasks: count }))
    };
  }
}

export default TaskScheduler;
