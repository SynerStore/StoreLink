import React, { useEffect, useState } from 'react';
import { ConfigProvider, theme, App as AntdApp, List, Progress, Button, Empty, Space, Tag } from 'antd';
import { PauseCircleOutlined, PlayCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import 'antd/dist/reset.css';

import '@/renderer/i18n';
import { useSettingStore, EnumTheme } from '@/renderer/store';
import { ETaskStatus } from '@/types';
import { taskRequest } from '@/renderer/utils';
import '@/renderer/styles/index.css';
import './index.css';

const TaskPanelApp = () => {
  const settingStore = useSettingStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const locale = settingStore.settings.lang === 'zh-CN' ? zhCN : enUS;

  const antdTheme = {
    algorithm: settingStore.settings.theme === EnumTheme.DARK ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#4856b3',
      borderRadius: 8,
      fontSize: 13,
    },
  };

  useEffect(() => {
    settingStore.initializeData();
  }, []);

  useEffect(() => {
    if (settingStore.settings.theme === EnumTheme.DARK) {
      document.body.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.body.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [settingStore.settings.theme]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const result = await taskRequest('list', {
        status: [ETaskStatus.RUNNING, ETaskStatus.PENDING, ETaskStatus.PAUSED, ETaskStatus.RETRYING],
        pageSize: 50,
      });
      if (result && result.list) {
        setTasks(result.list);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const timer = setInterval(loadTasks, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePause = async (taskId: string) => {
    await taskRequest('pause', { taskId });
    loadTasks();
  };

  const handleResume = async (taskId: string) => {
    await taskRequest('resume', { taskId });
    loadTasks();
  };

  const handleCancel = async (taskId: string) => {
    await taskRequest('delete', { taskId });
    loadTasks();
  };

  const getStatusTag = (status: ETaskStatus) => {
    const statusMap: Record<ETaskStatus, { color: string; text: string }> = {
      [ETaskStatus.PENDING]: { color: 'default', text: '等待中' },
      [ETaskStatus.RUNNING]: { color: 'processing', text: '运行中' },
      [ETaskStatus.PAUSED]: { color: 'warning', text: '已暂停' },
      [ETaskStatus.COMPLETED]: { color: 'success', text: '已完成' },
      [ETaskStatus.FAILED]: { color: 'error', text: '失败' },
      [ETaskStatus.CANCELED]: { color: 'default', text: '已取消' },
      [ETaskStatus.RETRYING]: { color: 'warning', text: '重试中' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  const getTaskName = (task: any) => {
    const typeMap: Record<string, string> = {
      upload: '上传',
      download: '下载',
      delete: '删除',
      copy: '复制',
      move: '移动',
      transfer: '传输',
      rename: '重命名',
    };
    return typeMap[task.type] || task.type;
  };

  return (
    <React.StrictMode>
      <ConfigProvider locale={locale} theme={antdTheme}>
        <AntdApp>
          <div className="task-panel-container">
            <div className="task-panel-header">
              <h3>正在进行的任务</h3>
              <span className="task-count">{tasks.length} 个任务</span>
            </div>
            <div className="task-panel-content">
              {tasks.length === 0 ? (
                <Empty description="暂无进行中的任务" />
              ) : (
                <List
                  loading={loading}
                  dataSource={tasks}
                  renderItem={(task) => (
                    <List.Item key={task.taskId}>
                      <div className="task-item">
                        <div className="task-item-header">
                          <span className="task-name">{getTaskName(task)}</span>
                          {getStatusTag(task.status)}
                        </div>
                        <Progress
                          percent={task.progress || 0}
                          size="small"
                          status={task.status === ETaskStatus.FAILED ? 'exception' : 'active'}
                        />
                        <div className="task-item-actions">
                          <Space size={4}>
                            {task.status === ETaskStatus.RUNNING && (
                              <Button
                                type="text"
                                size="small"
                                icon={<PauseCircleOutlined />}
                                onClick={() => handlePause(task.taskId)}
                              >
                                暂停
                              </Button>
                            )}
                            {task.status === ETaskStatus.PAUSED && (
                              <Button
                                type="text"
                                size="small"
                                icon={<PlayCircleOutlined />}
                                onClick={() => handleResume(task.taskId)}
                              >
                                继续
                              </Button>
                            )}
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<CloseCircleOutlined />}
                              onClick={() => handleCancel(task.taskId)}
                            >
                              取消
                            </Button>
                          </Space>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
        </AntdApp>
      </ConfigProvider>
    </React.StrictMode>
  );
};

export default TaskPanelApp;
