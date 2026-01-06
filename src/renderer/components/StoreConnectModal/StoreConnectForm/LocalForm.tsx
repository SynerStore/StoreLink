import { useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Switch } from 'antd';
import { FolderOutlined } from '@ant-design/icons';

import { StoreTypes } from '@/types';
import { events } from '@/renderer/utils';
import { useConfigStore } from '@/renderer/store';

const FormItem = Form.Item;

const LocalForm = forwardRef((_props, ref) => {
  const [form] = Form.useForm();
  const { addConnection } = useConfigStore();

  const handleSelectLocalDirPath = async () => {
    const dirPath = await events.getSingleDirPath();
    form.setFieldsValue({ root: dirPath });
  };

  useImperativeHandle(ref, () => {
    return {
      onConfirm: handleConfirm,
    };
  });

  // 确认
  const handleConfirm = async () => {
    const res = await form.validateFields();
    // 判断是否存在
    const newCons = await addConnection({
      type: StoreTypes.LOCAL,
      brand: 'local',
      name: res.name,
      config: {
        root: res.root,
        isShowHiddenFiles: res.isShowHiddenFiles || false,
      },
    });
    return newCons;
  };

  return (
    <Form form={form} autoComplete="off">
      <FormItem label="连接名称" name="name">
        <Input />
      </FormItem>
      <FormItem label="本机目录" name="root">
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
          placeholder="输入本机路径"
        />
      </FormItem>
      <FormItem label="显示隐藏文件" name="isShowHiddenFiles" valuePropName="checked" rules={[{ type: 'boolean' }]}>
        <Switch />
      </FormItem>
    </Form>
  );
});

export default LocalForm;
