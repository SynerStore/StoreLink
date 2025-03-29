import React, { Fragment, useState } from 'react';
import { Modal, Form, Input } from '@arco-design/web-react';

export type SettingPanelProps = {
  children?: React.ReactNode;
};
const SettingPanel: React.FC<SettingPanelProps> = (props: SettingPanelProps) => {
  const { children } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const handleOk = async () => {};

  return (
    <Fragment>
      <Modal
        title="设置"
        closable={false}
        maskClosable={false}
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        设置的配置 设置默认下载文件路径 设置任务传输限制数 语言切换 主题切换 网络代理 邮箱设置 webhooks 设置
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default SettingPanel;
