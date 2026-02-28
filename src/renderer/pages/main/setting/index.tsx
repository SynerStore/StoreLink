import { Form, Select, Radio, Space, Button, App, Switch, Divider, Typography } from 'antd';
import { useSettingStore, EnumLang, useConfigStore } from '@/renderer/store';
import { events } from '@/renderer/utils';
import { PageWrapper, UpdateTip } from '@/renderer/components';
import { useTranslation } from 'react-i18next';
import i18n from '@/renderer/i18n';

const { Text } = Typography;

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const Setting = () => {
  const settingStore = useSettingStore();
  const configStore = useConfigStore();
  const { t } = useTranslation();
  const { message } = App.useApp();

  const handleSwitchTheme = (e: any) => {
    const value = e.target.value;
    settingStore.update({
      theme: value,
    });
  };

  const handleSwitchLang = (value: EnumLang) => {
    i18n.changeLanguage(value);
    settingStore.update({
      lang: value,
    });
  };

  const handleSwitchNotification = (checked: boolean) => {
    settingStore.update({
      systemNotification: checked,
    });
  };

  const handleExportConnections = async () => {
    const dir = await events.getSingleDirPath({});
    if (!dir) return;
    const filePath = await events.exportConnections(dir);
    if (filePath) message.success(t('common.exportSuccess', { path: filePath }));
  };

  const handleImportConnections = async () => {
    const file = await events.getSingleFilePath({
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (!file) return;
    await events.importConnections(file);
    await configStore.initializeData();
    message.success(t('common.importSuccess'));
  };

  return (
    <PageWrapper title={t('settings.title')}>
      <Form autoComplete="off" layout="horizontal">
        <FormItem label={t('settings.theme')}>
          <RadioGroup name="size" value={settingStore.settings.theme} onChange={handleSwitchTheme} buttonStyle="solid">
            <Radio.Button value="light">{t('settings.themeLight')}</Radio.Button>
            <Radio.Button value="dark">{t('settings.themeDark')}</Radio.Button>
            <Radio.Button value="system">{t('settings.themeSystem')}</Radio.Button>
          </RadioGroup>
        </FormItem>
        <FormItem label={t('settings.language')}>
          <Select style={{ width: 150 }} value={settingStore.settings.lang} onChange={handleSwitchLang}>
            <Option value="zh-CN">{t('settings.langZh')}</Option>
            <Option value="en-US">{t('settings.langEn')}</Option>
          </Select>
        </FormItem>
        <FormItem label={t('settings.systemNotification')}>
          <Switch checked={settingStore.settings.systemNotification} onChange={handleSwitchNotification} />
        </FormItem>
        <FormItem label={t('connection.title')}>
          <Space>
            <Button type="primary" onClick={handleExportConnections}>
              {t('common.export')}
            </Button>
            <Button onClick={handleImportConnections}>{t('common.import')}</Button>
          </Space>
        </FormItem>
        <Divider />
        <FormItem label={t('settings.version')}>
          <Space>
            <Text>v{settingStore.settings.version || '0.0.0'}</Text>
            <UpdateTip />
          </Space>
        </FormItem>
        <FormItem label={t('settings.checkUpdate')}>
          <UpdateTip isButton />
        </FormItem>
      </Form>
    </PageWrapper>
  );
};

export default Setting;
