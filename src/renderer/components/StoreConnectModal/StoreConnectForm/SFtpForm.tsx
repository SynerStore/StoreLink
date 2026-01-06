import { useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Button } from 'antd';
import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes, StoreBrands } from '@/types';
import { useConfigStore } from '@/renderer/store';
const FormItem = Form.Item;

const SFtpForm = forwardRef((_props, ref) => {
  const [form] = Form.useForm();
  const { loading, setLoading } = useLoading();
  const { addConnection } = useConfigStore();

  useImperativeHandle(ref, () => {
    return {
      onConfirm: handleConfirm,
    };
  });

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
      type: StoreTypes.SFTP,
      brand: StoreBrands.sftp,
      name: res.host,
      config: {
        host: res.host,
        port: Number(res.port || 22),
        username: res.username,
        password: res.password,
        privateKey: res.privateKey,
        passphrase: res.passphrase,
      },
    };
    const newCons = await addConnection(connection);
    return newCons;
  };

  return (
    <Form form={form} autoComplete="off">
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
        <Input.Password />
      </FormItem>
      <FormItem label="私钥" name="privateKey">
        <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
      </FormItem>
      <FormItem label="口令" name="passphrase">
        <Input.Password />
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
