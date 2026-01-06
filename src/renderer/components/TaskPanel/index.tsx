import React, { Fragment, useState } from 'react';
import { Modal, Tabs } from 'antd';

import DownloadingTaskTable from './DownloadingTaskTable';
import FinishedTaskTable from './FinishedTaskTable';
import FailedTaskTable from './FailedTaskTable';
import UploadingTaskTable from './UploadingTaskTable';

import './index.css';

export type SettingPanelProps = {
  children?: React.ReactNode;
};

export enum ESettingPanelTab {
  Downloading = 'downloading',
  Uploading = 'uploading',
  Finished = 'finished',
  Failed = 'failed',
}
const TaskPanel: React.FC<SettingPanelProps> = (props: SettingPanelProps) => {
  const { children } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <Fragment>
      <Modal
        className="task-modal"
        title="任务管理"
        closable={true}
        maskClosable={false}
        footer={null}
        open={isModalOpen}
        width={900}
        onCancel={() => setIsModalOpen(false)}
        bodyStyle={{ height: 500, overflow: 'auto' }}
      >
        {/* 任务的上传下载同步等 */}
        <Tabs type="card" activeKey={activeTab} onChange={(key: string) => setActiveTab(key as ESettingPanelTab)} items={items} />
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default TaskPanel;
