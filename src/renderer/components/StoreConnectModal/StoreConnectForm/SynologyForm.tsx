import { useImperativeHandle, forwardRef, useEffect } from 'react';
import { Form, Input, Button, Switch } from 'antd';
import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes, StoreBrands } from '@/types';
import { useConfigStore } from '@/renderer/store';
import { SecurePasswordInput } from '@/renderer/components';

const FormItem = Form.Item;

type Props = { mode?: 'create' | 'edit'; initial?: any; onSubmit?: (conn: any) => Promise<any> | any };
const SynologyForm = forwardRef((props: Props, ref) => {
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
        useHttps: initial.config.useHttps,
        port: initial.config.port,
      });
    }
  }, [initial]);

  const handleTest = async () => {
    setLoading(true);
    const res = (form?.validateFields ? await form.validateFields(['address', 'username', 'password']) : form.getFieldsValue(true)) || {};
    const result = await storeConnect({
      type: StoreTypes.SYNOLOGY,
      config: {
        address: res.address,
        username: res.username,
        password: res.password ?? initial?.config?.password,
        useHttps: res.useHttps ?? true,
        port: res.port ?? 5001,
      },
    });
    console.log(result);
    setLoading(false);
  };

  const handleConfirm = async () => {
    const res = (form?.validateFields ? await form.validateFields() : form.getFieldsValue(true)) || {};
    const connection = {
      id: initial?.id,
      type: StoreTypes.SYNOLOGY,
      brand: StoreBrands.synology,
      name: res.name || res.address,
      config: {
        address: res.address,
        username: res.username,
        password: res.password,
        useHttps: res.useHttps ?? true,
        port: res.port ?? 5001,
      },
    };
    if (mode === 'edit' && onSubmit) {
      return onSubmit(connection);
    }
    return addConnection(connection);
  };

  return (
    <Form form={form} autoComplete="off">
      <FormItem label="连接名称" name="name">
        <Input />
      </FormItem>
      <FormItem label="服务器地址" name="address" rules={[{ required: true, message: '请输入服务器地址' }]}>
        <Input placeholder="例如：192.168.1.10 或 nas.example.com" />
      </FormItem>
      <FormItem label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
        <Input />
      </FormItem>
      <FormItem label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
        <SecurePasswordInput mode={mode} maskedLength={initial?.config?.password?.length} maskChar="*" />
      </FormItem>
      <FormItem label="启用 HTTPS" name="useHttps" valuePropName="checked" initialValue={true}>
        <Switch />
      </FormItem>
      <FormItem label="端口" name="port" initialValue={5001}>
        <Input />
      </FormItem>
      <FormItem wrapperCol={{ offset: 5 }}>
        <Button type="primary" size="small" onClick={handleTest} loading={loading}>
          链接测试
        </Button>
      </FormItem>
    </Form>
  );
});

export default SynologyForm;
