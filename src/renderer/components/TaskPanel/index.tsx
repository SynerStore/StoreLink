import React, { Fragment, useState } from 'react';
import { Modal, Tabs } from '@arco-design/web-react';

import DownloadingTaskTable from './DownloadingTaskTable';
import FinishedTaskTable from './FinishedTaskTable';
import FailedTaskTable from './FailedTaskTable';
import UploadingTaskTable from './UploadingTaskTable';

import './index.css';

const TabPane = Tabs.TabPane;
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

  return (
    <Fragment>
      <Modal
        className="task-modal"
        title="任务管理"
        closable={true}
        maskClosable={false}
        footer={null}
        focusLock={false}
        simple={true}
        visible={isModalOpen}
        style={{ width: 900, height: 500 }}
        onCancel={() => setIsModalOpen(false)}
      >
        {/* 任务的上传下载同步等 */}
        <Tabs type="capsule" activeTab={activeTab} onChange={(key: string) => setActiveTab(key as ESettingPanelTab)}>
          <TabPane key={ESettingPanelTab.Downloading} title="下载中">
            <DownloadingTaskTable />
          </TabPane>
          <TabPane key={ESettingPanelTab.Uploading} title="上传中">
            <UploadingTaskTable />
          </TabPane>
          <TabPane key={ESettingPanelTab.Finished} title="已完成">
            <FinishedTaskTable />
          </TabPane>
          <TabPane key={ESettingPanelTab.Failed} title="已失败">
            <FailedTaskTable />
          </TabPane>
        </Tabs>
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default TaskPanel;
