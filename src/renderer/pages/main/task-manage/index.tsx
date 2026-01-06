import React, { useState } from 'react';
import { Tabs } from 'antd';

import DownloadingTaskTable from '@/renderer/components/TaskPanel/DownloadingTaskTable';
import FinishedTaskTable from '@/renderer/components/TaskPanel/FinishedTaskTable';
import FailedTaskTable from '@/renderer/components/TaskPanel/FailedTaskTable';
import UploadingTaskTable from '@/renderer/components/TaskPanel/UploadingTaskTable';

export enum ETaskManageTab {
  Downloading = 'downloading',
  Uploading = 'uploading',
  Finished = 'finished',
  Failed = 'failed',
}

const TaskManage: React.FC = () => {
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
    <div style={{ padding: 16, width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: 16 }}>任务管理</h2>
      <Tabs
        type="card"
        activeKey={activeTab}
        onChange={(key: string) => setActiveTab(key as ETaskManageTab)}
        items={items}
        style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      />
    </div>
  );
};

export default TaskManage;
