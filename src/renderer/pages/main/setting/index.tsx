import { Form, Select, Radio, Space, Button, message } from 'antd';
import { useSettingStore, EnumLang, useConfigStore } from '@/renderer/store';
import { events } from '@/renderer/utils';
import { PageWrapper } from '@/renderer/components';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const Setting = () => {
  const settingStore = useSettingStore();
  const configStore = useConfigStore();

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
    <PageWrapper title="设置">
      <Form autoComplete="off" layout="horizontal">
        <FormItem label="主题样式">
          <RadioGroup name="size" value={settingStore.settings.theme} onChange={handleSwitchTheme}>
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
            <Button type="primary" onClick={handleExportConnections}>
              导出
            </Button>
            <Button onClick={handleImportConnections}>导入</Button>
          </Space>
        </FormItem>
      </Form>
    </PageWrapper>
  );
};

export default Setting;
