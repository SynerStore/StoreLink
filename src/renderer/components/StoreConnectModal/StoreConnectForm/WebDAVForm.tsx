import { useImperativeHandle, forwardRef, useEffect } from 'react';
import { Form, Input, Button } from 'antd';

import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes, StoreBrands } from '@/types';
import { useConfigStore } from '@/renderer/store';
import { SecurePasswordInput } from '@/renderer/components';

const FormItem = Form.Item;

type Props = { mode?: 'create' | 'edit'; initial?: any; onSubmit?: (conn: any) => Promise<any> | any };
const WebDAVForm = forwardRef((props: Props, ref) => {
  const [form] = Form.useForm();
  const { loading, setLoading } = useLoading();
  const { addConnection } = useConfigStore();
  const { mode = 'create', initial, onSubmit } = props;

  useImperativeHandle(ref, () => {
    return {
      onConfirm: handleConfirm,
    };
  });

  useEffect(() => {
    if (initial?.config) {
      form.setFieldsValue({
        name: initial.name,
        address: initial.config.address,
        username: initial.config.username,
      });
    }
  }, [initial]);
  const handleTest = async () => {
    setLoading(true);
    const res = await form.validateFields();
    const result = await storeConnect({
      type: StoreTypes.WEBDAV,
      config: {
        address: res.address,
        username: res.username,
        password: res.password ?? initial?.config?.password,
      },
    });
    console.log(result);
    setLoading(false);
  };

  const handleConfirm = async () => {
    const res = await form.validateFields();
    const connection = {
      id: initial?.id,
      type: StoreTypes.WEBDAV,
      brand: StoreBrands.WebDAV,
      name: res.name || res.address,
      config: {
        address: res.address,
        username: res.username,
        password: res.password,
      },
    };
    if (mode === 'edit' && onSubmit) {
      return onSubmit(connection);
    }
    return addConnection(connection);
  };
  return (
    <Form form={form}  autoComplete="off">
      <FormItem label="连接名称" name="name">
        <Input />
      </FormItem>
      <FormItem label="服务器地址" name="address">
        <Input />
      </FormItem>
      <FormItem label="账号" name="username">
        <Input />
      </FormItem>
      <FormItem label="密码" name="password">
        <SecurePasswordInput mode={mode} />
      </FormItem>
      <FormItem wrapperCol={{ offset: 5 }}>
        <Button type="primary" size="small" onClick={handleTest} loading={loading}>
          链接测试
        </Button>
      </FormItem>
    </Form>
  );
});

export default WebDAVForm;
