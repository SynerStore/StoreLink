import { useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Switch } from '@arco-design/web-react';
import { IconFolder } from '@arco-design/web-react/icon';

import { StoreTypes } from '@/types';
import { events } from '@/renderer/utils';
import { useConfigStore } from '@/renderer/store';

const FormItem = Form.Item;

const LocalForm = forwardRef((_props, ref) => {
  const [form] = Form.useForm();
  const { addConnection } = useConfigStore();

  const handleSelectLocalDirPath = async () => {
    const dirPath = await events.getSingleDirPath();
    form.setFieldValue('root', dirPath);
  };

  useImperativeHandle(ref, () => {
    return {
      onConfirm: handleConfirm,
    };
  });

  // 确认
  const handleConfirm = async () => {
    const res = await form.validate();
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
    <Form form={form} style={{ width: 600 }} autoComplete="off">
      <FormItem label="连接名称" field="name">
        <Input />
      </FormItem>
      <FormItem label="本机目录" field="root">
        <Input
          addAfter={
            <IconFolder
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
      <FormItem label="显示隐藏文件" field="isShowHiddenFiles" triggerPropName="checked" rules={[{ type: 'boolean' }]}>
        <Switch />
      </FormItem>
    </Form>
  );
});

export default LocalForm;
