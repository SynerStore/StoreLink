import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import path from 'path';
import TaskManager from '../tasks/manage';
import { MainWindow } from '../windows/main';
import { ETaskStatus } from '@/types';

export default class TrayManager {
  private static instance: TrayManager;
  private tray: Tray | null = null;
  private taskPanelWindow: BrowserWindow | null = null;
  private iconPath: string;

  private constructor() {
    // 根据平台选择图标路径
    const iconDir = path.join(__dirname, '../../scripts/assets');
    if (process.platform === 'darwin') {
      // macOS 使用 16x16 或 32x32 的图标
      this.iconPath = path.join(iconDir, '16x16.png');
    } else if (process.platform === 'win32') {
      // Windows 使用 32x32
      this.iconPath = path.join(iconDir, '32x32.png');
    } else {
      this.iconPath = path.join(iconDir, '32x32.png');
    }
  }

  public static getInstance(): TrayManager {
    if (!TrayManager.instance) {
      TrayManager.instance = new TrayManager();
    }
    return TrayManager.instance;
  }

  public createTray() {
    if (this.tray) return;

    console.log('Creating tray with icon path:', this.iconPath);
    console.log('Icon file exists:', require('fs').existsSync(this.iconPath));

    let icon = nativeImage.createFromPath(this.iconPath);
    console.log('Icon created:', !icon.isEmpty(), 'Size:', icon.getSize());

    // macOS 使用模板图标，自动适应深色/浅色模式
    if (process.platform === 'darwin') {
      // 如果图标创建失败或为空，使用默认图标
      if (icon.isEmpty()) {
        console.log('Icon is empty, creating default icon');
        // 创建一个简单的 16x16 黑白图标
        icon = nativeImage.createEmpty();
      } else {
        icon.setTemplateImage(true);
      }
    }

    try {
      this.tray = new Tray(icon);
      this.tray.setToolTip('StoreLink');
      console.log('Tray created successfully');

      // 点击显示任务面板
      this.tray.on('click', () => {
        this.toggleTaskPanel();
      });

      // 右键显示菜单
      this.tray.on('right-click', () => {
        this.showContextMenu();
      });

      // 定期更新托盘图标提示文本
      this.startMonitoring();
    } catch (error) {
      console.error('Failed to create tray:', error);
    }
  }

  private toggleTaskPanel() {
    if (this.taskPanelWindow) {
      if (this.taskPanelWindow.isVisible()) {
        this.taskPanelWindow.hide();
      } else {
        this.showTaskPanel();
      }
    } else {
      this.createTaskPanel();
      this.showTaskPanel();
    }
  }

  private createTaskPanel() {
    if (this.taskPanelWindow) return;

    this.taskPanelWindow = new BrowserWindow({
      width: 400,
      height: 500,
      show: false,
      frame: false,
      resizable: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js'),
      },
    });

    // 加载任务面板页面
    if (process.env.NODE_ENV === 'development') {
      this.taskPanelWindow.loadURL(`http://localhost:3099/task-panel.html`);
    } else {
      this.taskPanelWindow.loadFile(path.join(__dirname, '../task-panel.html'));
    }

    // 点击外部关闭
    this.taskPanelWindow.on('blur', () => {
      this.taskPanelWindow?.hide();
    });

    this.taskPanelWindow.on('closed', () => {
      this.taskPanelWindow = null;
    });
  }

  private showTaskPanel() {
    if (!this.taskPanelWindow) {
      this.createTaskPanel();
    }

    if (this.taskPanelWindow) {
      // 计算窗口位置（托盘图标附近）
      const trayBounds = this.tray?.getBounds();
      if (trayBounds) {
        const windowBounds = this.taskPanelWindow.getBounds();
        let x, y;

        if (process.platform === 'darwin') {
          // macOS: 窗口在托盘图标下方
          x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
          y = Math.round(trayBounds.y + trayBounds.height + 4);
        } else {
          // Windows/Linux: 窗口在托盘图标上方
          x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
          y = Math.round(trayBounds.y - windowBounds.height - 4);
        }

        this.taskPanelWindow.setPosition(x, y);
      }

      this.taskPanelWindow.show();
      this.taskPanelWindow.focus();
    }
  }

  private showContextMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: '主界面',
        click: () => {
          MainWindow.getInstance()?.show();
        },
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          app.quit();
        },
      },
    ];

    const contextMenu = Menu.buildFromTemplate(template);
    this.tray?.popUpContextMenu(contextMenu);
  }

  private startMonitoring() {
    setInterval(() => {
      this.updateTrayTooltip();
    }, 1000);
  }

  private updateTrayTooltip() {
    try {
      const manager = TaskManager.getInstance();
      const tasks = manager.getTasks({ status: [ETaskStatus.RUNNING, ETaskStatus.PENDING], pageSize: 100 });
      const runningCount = tasks.list.filter((t: any) => t.status === ETaskStatus.RUNNING).length;
      const pendingCount = tasks.list.filter((t: any) => t.status === ETaskStatus.PENDING).length;

      let tooltip = 'StoreLink';
      if (runningCount > 0 || pendingCount > 0) {
        tooltip = `StoreLink\n正在运行: ${runningCount} 个任务\n等待中: ${pendingCount} 个任务`;
      }

      this.tray?.setToolTip(tooltip);
    } catch (err) {
      console.error('Failed to update tray tooltip:', err);
    }
  }

  public destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
    if (this.taskPanelWindow) {
      this.taskPanelWindow.close();
      this.taskPanelWindow = null;
    }
  }
}
