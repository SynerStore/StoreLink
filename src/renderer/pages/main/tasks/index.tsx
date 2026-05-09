import React, { useState } from 'react';
import { Tabs, Badge } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import PageWrapper from '@/renderer/components/PageWrapper';
import RunningTaskTable from './RunningTaskTable';
import CompletedTaskTable from './CompletedTaskTable';
import TaskLogTable from './TaskLogTable';
import './index.css';

export enum ETaskManageTab {
  Running = 'running',
  Completed = 'completed',
  Logs = 'logs',
}

const Tasks: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ETaskManageTab>(ETaskManageTab.Running);

  const items = [
    {
      key: ETaskManageTab.Running,
      label: (
        <span className="task-tab-label">
          <PlayCircleOutlined />
          {t('tasks.tabs.running')}
        </span>
      ),
      children: <RunningTaskTable />,
    },
    {
      key: ETaskManageTab.Completed,
      label: (
        <span className="task-tab-label">
          <CheckCircleOutlined />
          {t('tasks.tabs.completed')}
        </span>
      ),
      children: <CompletedTaskTable />,
    },
    {
      key: ETaskManageTab.Logs,
      label: (
        <span className="task-tab-label">
          <FileTextOutlined />
          {t('tasks.tabs.logs')}
        </span>
      ),
      children: <TaskLogTable />,
    },
  ];

  return (
    <PageWrapper title={t('tasks.manageTitle')}>
      <div className="task-tabs-wrapper">
        <Tabs
          activeKey={activeTab}
          onChange={(key: string) => setActiveTab(key as ETaskManageTab)}
          items={items}
          size="large"
        />
      </div>
    </PageWrapper>
  );
};

export default Tasks;
