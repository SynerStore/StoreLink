import { useImperativeHandle, forwardRef, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes, StoreBrands } from '@/types';
import { useConfigStore } from '@/renderer/store';
import { SecurePasswordInput } from '@/renderer/components';
const FormItem = Form.Item;

type Props = { mode?: 'create' | 'edit'; initial?: any; onSubmit?: (conn: any) => Promise<any> | any };
const SFtpForm = forwardRef((props: Props, ref) => {
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
        host: initial.config.host,
        port: initial.config.port,
        username: initial.config.username,
      });
    }
  }, [initial]);
  const handleTest = async () => {
    setLoading(true);
    const res = await form.validateFields();
    const result = await storeConnect({
      type: StoreTypes.SFTP,
      config: {
        host: res.host,
        port: Number(res.port || 22),
        username: res.username,
        password: res.password,
        privateKey: res.privateKey,
        passphrase: res.passphrase,
      },
    });
    console.log(result);
    setLoading(false);
  };

  const handleConfirm = async () => {
    const res = await form.validateFields();
    const connection = {
      id: initial?.id,
      type: StoreTypes.SFTP,
      brand: StoreBrands.sftp,
      name: res.name || res.host,
      config: {
        host: res.host,
        port: Number(res.port || 22),
        username: res.username,
        password: res.password ?? initial?.config?.password,
        privateKey: res.privateKey ?? initial?.config?.privateKey,
        passphrase: res.passphrase ?? initial?.config?.passphrase,
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
      <FormItem label="主机" name="host" rules={[{ required: true }]}>
        <Input />
      </FormItem>
      <FormItem label="端口" name="port" rules={[{ required: true }]} initialValue="22">
        <Input />
      </FormItem>
      <FormItem label="账号" name="username" rules={[{ required: true }]}>
        <Input />
      </FormItem>
      <FormItem label="密码" name="password">
        <SecurePasswordInput mode={mode} />
      </FormItem>
      <FormItem label="私钥" name="privateKey">
        <SecurePasswordInput mode={mode} multiline />
      </FormItem>
      <FormItem label="口令" name="passphrase">
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

export default SFtpForm;
