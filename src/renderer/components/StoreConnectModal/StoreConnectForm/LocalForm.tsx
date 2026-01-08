import { useImperativeHandle, forwardRef, useEffect } from 'react';
import { Form, Input, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { FolderOutlined } from '@ant-design/icons';

import { StoreTypes } from '@/types';
import { events } from '@/renderer/utils';
import { useConfigStore } from '@/renderer/store';

const FormItem = Form.Item;

type Props = { mode?: 'create' | 'edit'; initial?: any; onSubmit?: (conn: any) => Promise<any> | any };
const LocalForm = forwardRef((props: Props, ref) => {
  const [form] = Form.useForm();
  const { addConnection } = useConfigStore();
  const { mode = 'create', initial, onSubmit } = props;
  const { t } = useTranslation();

  const handleSelectLocalDirPath = async () => {
    const dirPath = await events.getSingleDirPath();
    form.setFieldsValue({ root: dirPath });
  };

  useImperativeHandle(ref, () => {
    return {
      onConfirm: handleConfirm,
    };
  });

  useEffect(() => {
    if (initial?.config) {
      form.setFieldsValue({
        name: initial.name,
        root: initial.config.root,
        isShowHiddenFiles: initial.config.isShowHiddenFiles,
      });
    }
  }, [initial]);
  // 确认
  const handleConfirm = async () => {
    const res = await form.validateFields();
    const payload = {
      id: initial?.id,
      type: StoreTypes.LOCAL,
      brand: 'local',
      name: res.name,
      config: {
        root: res.root,
        isShowHiddenFiles: res.isShowHiddenFiles || false,
      },
    };
    if (mode === 'edit' && onSubmit) {
      return onSubmit(payload);
    }
    return addConnection(payload);
  };

  return (
    <Form form={form} autoComplete="off">
      <FormItem label={t('connection.name')} name="name">
        <Input />
      </FormItem>
      <FormItem label={t('connection.localRoot')} name="root">
        <Input
          addonAfter={
            <FolderOutlined
              onClick={handleSelectLocalDirPath}
              style={{
                color: 'var(--primary-color)',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            />
          }
          allowClear
          placeholder={t('connection.localRootPlaceholder')}
        />
      </FormItem>
      <FormItem
        label={t('connection.showHiddenFiles')}
        name="isShowHiddenFiles"
        valuePropName="checked"
        rules={[{ type: 'boolean' }]}
      >
        <Switch />
      </FormItem>
    </Form>
  );
});

export default LocalForm;
