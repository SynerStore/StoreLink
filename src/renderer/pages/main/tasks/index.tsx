import React, { useState } from 'react';
import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

import PageWrapper from '@/renderer/components/PageWrapper';
import DownloadingTaskTable from './DownloadingTaskTable';
import FinishedTaskTable from './FinishedTaskTable';
import FailedTaskTable from './FailedTaskTable';
import UploadingTaskTable from './UploadingTaskTable';
import './index.css';

export enum ETaskManageTab {
  Downloading = 'downloading',
  Uploading = 'uploading',
  Finished = 'finished',
  Failed = 'failed',
}

const Tasks: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ETaskManageTab>(ETaskManageTab.Downloading);

  const items = [
    {
      key: ETaskManageTab.Downloading,
      label: t('tasks.tabs.downloading'),
      children: <DownloadingTaskTable />,
    },
    {
      key: ETaskManageTab.Uploading,
      label: t('tasks.tabs.uploading'),
      children: <UploadingTaskTable />,
    },
    {
      key: ETaskManageTab.Finished,
      label: t('tasks.tabs.finished'),
      children: <FinishedTaskTable />,
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
        type="card"
        activeKey={activeTab}
        onChange={(key: string) => setActiveTab(key as ETaskManageTab)}
        items={items}
        style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      />
    </PageWrapper>
  );
};

export default Tasks;
