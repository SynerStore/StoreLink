import React, { useState } from 'react';
import { Tabs } from 'antd';

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
  const [activeTab, setActiveTab] = useState<ETaskManageTab>(ETaskManageTab.Downloading);

  const items = [
    {
      key: ETaskManageTab.Downloading,
      label: '下载中',
      children: <DownloadingTaskTable />,
    },
    {
      key: ETaskManageTab.Uploading,
      label: '上传中',
      children: <UploadingTaskTable />,
    },
    {
      key: ETaskManageTab.Finished,
      label: '已完成',
      children: <FinishedTaskTable />,
    },
    {
      key: ETaskManageTab.Failed,
      label: '已失败',
      children: <FailedTaskTable />,
    },
  ];

  return (
    <PageWrapper title="任务管理">
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
