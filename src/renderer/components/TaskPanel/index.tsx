import React, { useState } from 'react';
import { Tabs } from 'antd';

import DownloadingTaskTable from './DownloadingTaskTable';
import FinishedTaskTable from './FinishedTaskTable';
import FailedTaskTable from './FailedTaskTable';
import UploadingTaskTable from './UploadingTaskTable';

import './index.css';

export enum ESettingPanelTab {
  Downloading = 'downloading',
  Uploading = 'uploading',
  Finished = 'finished',
  Failed = 'failed',
}
const TaskPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ESettingPanelTab>(ESettingPanelTab.Downloading);

  const items = [
    {
      key: ESettingPanelTab.Downloading,
      label: '下载中',
      children: <DownloadingTaskTable />,
    },
    {
      key: ESettingPanelTab.Uploading,
      label: '上传中',
      children: <UploadingTaskTable />,
    },
    {
      key: ESettingPanelTab.Finished,
      label: '已完成',
      children: <FinishedTaskTable />,
    },
    {
      key: ESettingPanelTab.Failed,
      label: '已失败',
      children: <FailedTaskTable />,
    },
  ];

  return (
    <div className="task-panel" style={{ width: '100%', height: '100%', padding: '20px' }}>
      <Tabs type="card" activeKey={activeTab} onChange={(key: string) => setActiveTab(key as ESettingPanelTab)} items={items} />
    </div>
  );
};

export default TaskPanel;
