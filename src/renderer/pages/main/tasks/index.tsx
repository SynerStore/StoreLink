import React, { useState } from 'react';
import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

import PageWrapper from '@/renderer/components/PageWrapper';
import PendingTaskTable from './PendingTaskTable';
import RunningTaskTable from './RunningTaskTable';
import CompletedTaskTable from './CompletedTaskTable';
import FailedTaskTable from './FailedTaskTable';
import './index.css';

export enum ETaskManageTab {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

const Tasks: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ETaskManageTab>(ETaskManageTab.Running);

  const items = [
    {
      key: ETaskManageTab.Pending,
      label: t('tasks.tabs.pending'),
      children: <PendingTaskTable />,
    },
    {
      key: ETaskManageTab.Running,
      label: t('tasks.tabs.running'),
      children: <RunningTaskTable />,
    },
    {
      key: ETaskManageTab.Completed,
      label: t('tasks.tabs.completed'),
      children: <CompletedTaskTable />,
    },
    {
      key: ETaskManageTab.Failed,
      label: t('tasks.tabs.failed'),
      children: <FailedTaskTable />,
    },
  ];

  return (
    <PageWrapper title={t('tasks.manageTitle')}>
      <Tabs
        activeKey={activeTab}
        onChange={(key: string) => setActiveTab(key as ETaskManageTab)}
        items={items}
        style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      />
    </PageWrapper>
  );
};

export default Tasks;
