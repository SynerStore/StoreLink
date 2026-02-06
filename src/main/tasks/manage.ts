import { ipcMain } from 'electron';
import db from '@/main/db/sqlite';
import TaskEntity, { TaskEntityParams } from './entity';
import { EChannels, ETaskStatus } from '@/types';
import { MainWindow } from '@/main/windows/main';
import { logAction } from '@/main/events/log';
import TaskScheduler from './scheduler';

class TaskManager {
  private static instance: TaskManager;
  private tasks: Map<string, TaskEntity> = new Map();

  private constructor() {
    this.init();
    this.startMonitoring();
  }

  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  public getTaskById(taskId: string): TaskEntity | undefined {
    return this.tasks.get(taskId);
  }

  public restoreTask(row: any): TaskEntity {
    const params: TaskEntityParams = {
      ...row,
      params: typeof row.params === 'string' ? JSON.parse(row.params) : row.params,
    };
    const task = new TaskEntity(params);
    this.setupTask(task);
    this.tasks.set(task.taskId, task);
    return task;
  }

  private init() {
    // Load incomplete tasks from DB
    try {
      const rows = db
        .prepare(
          `
        SELECT * FROM tasks
        WHERE status IN (?, ?, ?)
      `,
        )
        .all(ETaskStatus.PENDING, ETaskStatus.RUNNING, ETaskStatus.PAUSED) as any[];

      rows.forEach((row) => {
        const params: TaskEntityParams = {
          ...row,
          params: JSON.parse(row.params),
        };
        const task = new TaskEntity(params);
        // If it was running, mark it as paused or pending to restart?
        // For now, let's set it to PAUSED if it was RUNNING to avoid auto-restart issues without user intent
        if (task.status === ETaskStatus.RUNNING) {
          task.status = ETaskStatus.PAUSED;
          this.updateTaskInDb(task);
        }

        this.setupTask(task);
        this.tasks.set(task.taskId, task);
      });
    } catch (err) {
      console.error('Failed to init tasks:', err);
    }
  }

  private setupTask(task: TaskEntity) {
    task.setCallbacks(
      () => {
        this.notifyRenderer(task);
      },
      (status, err) => {
        // On status change
        this.updateTaskInDb(task);
        this.notifyRenderer(task);

        if (status === ETaskStatus.COMPLETED || status === ETaskStatus.FAILED || status === ETaskStatus.CANCELED) {
          // Maybe remove from memory map if we don't want to keep history in memory?
          // But user might want to see history.
          let msg = '';
          if (status === ETaskStatus.COMPLETED) {
            msg = 'completed';
          } else if (status === ETaskStatus.FAILED) {
            msg = `failed: ${err || ''}`;
          } else {
            msg = 'canceled';
          }
          logAction({
            action: 'task_status',
            message: `${task.method} ${msg}`,
            meta: { connectionId: task.connectionId, taskId: task.taskId, params: task.params },
          });
        }
      },
    );
  }

  private updateTaskInDb(task: TaskEntity) {
    try {
      const row = task.toRow();
      db.prepare(
        `
        INSERT OR REPLACE INTO tasks (
          taskId, type, connectionId, method, params, status,
          progress, speed, size, startTime, endTime, createTime, errorMessage
        ) VALUES (
          @taskId, @type, @connectionId, @method, @params, @status,
          @progress, @speed, @size, @startTime, @endTime, @createTime, @errorMessage
        )
      `,
      ).run(row);
    } catch (err) {
      console.error('Failed to update task in DB:', err);
    }
  }

  private startMonitoring() {
    setInterval(() => {
      const stats = TaskScheduler.getInstance().getStats();
      const pendingTasks = this.getTasks({ status: ETaskStatus.PENDING }).total;

      const payload = {
        ...stats,
        pendingTasks
      };

      MainWindow.getInstance()?.window?.webContents.send(EChannels.taskStats, payload);
    }, 1000);
  }

  private notifyRenderer(task: TaskEntity) {
    const mainWin = MainWindow.getInstance();
    const win = mainWin?.window;
    if (win) {
      win.webContents.send(EChannels.taskUpdate, task.toRow());
    }
  }

  public async createTask(params: TaskEntityParams) {
    const task = new TaskEntity(params);
    this.setupTask(task);
    this.tasks.set(task.taskId, task);
    this.updateTaskInDb(task);
    this.notifyRenderer(task);

    // Auto start
    task.run();
    return task.toRow();
  }

  public async pauseTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      await task.pause();
      this.updateTaskInDb(task);
      this.notifyRenderer(task);
    }
  }

  public async resumeTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      await task.resume();
      this.updateTaskInDb(task);
      this.notifyRenderer(task);
    }
  }

  public async deleteTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      await task.cancel();
      this.tasks.delete(taskId);
    }

    // Remove from DB
    try {
      db.prepare('DELETE FROM tasks WHERE taskId = ?').run(taskId);
      // Notify renderer about deletion
      const mainWin = MainWindow.getInstance();
      const win = mainWin?.window;
      if (win) {
        win.webContents.send(EChannels.taskUpdate, { taskId, _deleted: true });
      }
    } catch (err) {
      console.error('Failed to delete task from DB:', err);
    }
  }

  public getTasks(params?: any) {
    try {
      const { status, type, current = 1, pageSize = 20 } = params || {};
      const offset = (current - 1) * pageSize;

      let baseQuery = 'FROM tasks';
      const whereClauses: string[] = [];
      const args: any[] = [];

      if (status && Array.isArray(status) && status.length > 0) {
        const placeholders = status.map(() => '?').join(',');
        whereClauses.push(`status IN (${placeholders})`);
        args.push(...status);
      } else if (status) {
         // Single status support for backward compatibility or if passed as number
         whereClauses.push('status = ?');
         args.push(status);
      }

      if (type && Array.isArray(type) && type.length > 0) {
        const placeholders = type.map(() => '?').join(',');
        whereClauses.push(`type IN (${placeholders})`);
        args.push(...type);
      }

      if (whereClauses.length > 0) {
        baseQuery += ' WHERE ' + whereClauses.join(' AND ');
      }

      // Count query
      const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
      const totalRow = db.prepare(countQuery).get(...args) as any;
      const total = totalRow?.total || 0;

      // Data query
      const query = `SELECT * ${baseQuery} ORDER BY createTime DESC LIMIT ? OFFSET ?`;
      const rows = db.prepare(query).all(...args, pageSize, offset) as any[];

      const list = rows.map((row) => ({
        ...row,
        params: JSON.parse(row.params),
      }));

      return { list, total, current, pageSize };
    } catch (err) {
      console.error('Failed to get tasks:', err);
      return { list: [], total: 0, current: 1, pageSize: 20 };
    }
  }
}

export const taskRequestRegistry = () => {
  const manager = TaskManager.getInstance();

  ipcMain.handle(EChannels.taskRequest, async (_event, data: any) => {
    const { action, params } = data;
    switch (action) {
      case 'create':
        return await manager.createTask(params);
      case 'pause':
        return await manager.pauseTask(params.taskId);
      case 'resume':
        return await manager.resumeTask(params.taskId);
      case 'delete':
        return await manager.deleteTask(params.taskId);
      case 'list':
        return manager.getTasks(params);
      default:
        throw new Error(`Unknown task action: ${action}`);
    }
  });
};

export default TaskManager;
