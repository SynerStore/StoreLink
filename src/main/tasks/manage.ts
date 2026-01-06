import { ipcMain, BrowserWindow } from 'electron';
import db from '@/main/db/sqlite';
import TaskEntity, { TaskEntityParams } from './entity';
import { EChannels, ETaskStatus } from '@/types';
import { MainWindow } from '@/main/windows/main';

class TaskManager {
  private static instance: TaskManager;
  private tasks: Map<string, TaskEntity> = new Map();

  private constructor() {
    this.init();
  }

  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  private init() {
    // Load incomplete tasks from DB
    try {
      const rows = db.prepare(`
        SELECT * FROM tasks
        WHERE status IN (?, ?, ?)
      `).all(ETaskStatus.PENDING, ETaskStatus.RUNNING, ETaskStatus.PAUSED) as any[];

      rows.forEach(row => {
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
      (data) => {
        // On progress
        // Throttle DB updates if needed, but for now just update
        // We might not want to update DB on every chunk for speed, but for simplicity let's do it
        // Or better, only send IPC, and update DB less frequently
        this.notifyRenderer(task);
      },
      (status, err) => {
        // On status change
        this.updateTaskInDb(task);
        this.notifyRenderer(task);

        if (status === ETaskStatus.COMPLETED || status === ETaskStatus.FAILED || status === ETaskStatus.CANCELED) {
          // Maybe remove from memory map if we don't want to keep history in memory?
          // But user might want to see history.
        }
      }
    );
  }

  private updateTaskInDb(task: TaskEntity) {
    try {
      const row = task.toRow();
      db.prepare(`
        INSERT OR REPLACE INTO tasks (
          taskId, type, connectionId, method, params, status,
          progress, speed, size, startTime, endTime, createTime, errorMessage
        ) VALUES (
          @taskId, @type, @connectionId, @method, @params, @status,
          @progress, @speed, @size, @startTime, @endTime, @createTime, @errorMessage
        )
      `).run(row);
    } catch (err) {
      console.error('Failed to update task in DB:', err);
    }
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
      // If requesting history, might need to query DB for completed tasks not in memory
      // For now, return all tasks from DB
      let query = 'SELECT * FROM tasks';
      const args = [];

      if (params?.status) {
        query += ' WHERE status = ?';
        args.push(params.status);
      }

      query += ' ORDER BY createTime DESC';

      const rows = db.prepare(query).all(...args) as any[];
      return rows.map(row => ({
        ...row,
        params: JSON.parse(row.params)
      }));
    } catch (err) {
      console.error('Failed to get tasks:', err);
      return [];
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
