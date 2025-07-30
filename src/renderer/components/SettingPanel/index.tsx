import React, { Fragment, useState } from 'react';
import { Modal, Form, Select, Radio } from '@arco-design/web-react';

import { useSettingStore, EnumTheme, EnumLang } from '@/renderer/store';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

export type SettingPanelProps = {
  children?: React.ReactNode;
};
const SettingPanel: React.FC<SettingPanelProps> = (props: SettingPanelProps) => {
  const { children } = props;

  const settingStore = useSettingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSwitchTheme = (value: EnumTheme) => {
    settingStore.update({
      theme: value,
    });
    if (value === EnumTheme.DARK) {
      document.body.setAttribute('arco-theme', 'dark');
    }
    if (value === EnumTheme.LIGHT) {
      document.body.removeAttribute('arco-theme');
    }
  };

  const handleSwitchLang = (value: EnumLang) => {
    settingStore.update({
      lang: value,
    });
  };

  return (
    <Fragment>
      <Modal
        title="设置"
        simple={true}
        closable={false}
        maskClosable={false}
        visible={isModalOpen}
        // onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="关闭"
      >
        <Form autoComplete="off" layout="horizontal">
          <FormItem label="主题样式">
            <RadioGroup
              type="button"
              name="size"
              value={settingStore.settings.theme}
              onChange={handleSwitchTheme}
              style={{ marginBottom: 20, borderRadius: 4 }}
            >
              <Radio value="light">浅色</Radio>
              <Radio value="dark">深色</Radio>
              <Radio value="system">系统</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="语言">
            <Select style={{ width: 150 }} value={settingStore.settings.lang} onChange={handleSwitchLang}>
              <Option value="zh-CN">中文</Option>
              <Option value="en-US">英文</Option>
            </Select>
          </FormItem>
        </Form>
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default SettingPanel;
