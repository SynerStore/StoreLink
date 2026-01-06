import React, { Fragment, useState } from 'react';
import { Modal, Form, Select, Radio, Space, Button, message } from 'antd';

import { useSettingStore, EnumTheme, EnumLang, useConfigStore } from '@/renderer/store';
import { events } from '@/renderer/utils';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

export type SettingPanelProps = {
  children?: React.ReactNode;
};
const SettingPanel: React.FC<SettingPanelProps> = (props: SettingPanelProps) => {
  const { children } = props;

  const settingStore = useSettingStore();
  const configStore = useConfigStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSwitchTheme = (e: any) => {
    const value = e.target.value;
    settingStore.update({
      theme: value,
    });
  };

  const handleSwitchLang = (value: EnumLang) => {
    settingStore.update({
      lang: value,
    });
  };

  const handleExportConnections = async () => {
    const dir = await events.getSingleDirPath({});
    if (!dir) return;
    const filePath = await events.exportConnections(dir);
    if (filePath) message.success('已导出到 ' + filePath);
  };

  const handleImportConnections = async () => {
    const file = await events.getSingleFilePath({
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (!file) return;
    await events.importConnections(file);
    await configStore.initializeData();
    message.success('已导入连接配置');
  };

  return (
    <Fragment>
      <Modal
        title="设置"
        closable={true}
        maskClosable={false}
        open={isModalOpen}
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { display: 'none' } }}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form autoComplete="off" layout="horizontal">
          <FormItem label="主题样式">
            <RadioGroup
              name="size"
              value={settingStore.settings.theme}
              onChange={handleSwitchTheme}
            >
              <Radio.Button value="light">浅色</Radio.Button>
              <Radio.Button value="dark">深色</Radio.Button>
              <Radio.Button value="system">系统</Radio.Button>
            </RadioGroup>
          </FormItem>
          <FormItem label="语言">
            <Select style={{ width: 150 }} value={settingStore.settings.lang} onChange={handleSwitchLang}>
              <Option value="zh-CN">中文</Option>
              <Option value="en-US">英文</Option>
            </Select>
          </FormItem>
          <FormItem label="连接配置">
            <Space>
              <Button size="small" type="primary" onClick={handleExportConnections}>
                导出
              </Button>
              <Button size="small" onClick={handleImportConnections}>
                导入
              </Button>
            </Space>
          </FormItem>
        </Form>
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default SettingPanel;
