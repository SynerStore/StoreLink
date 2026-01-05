import { useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Button } from '@arco-design/web-react';
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
    const res = await form.validate();
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
    const res = await form.validate();
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
      <FormItem label="主机" field="host" rules={[{ required: true }]}>
        <Input />
      </FormItem>
      <FormItem label="端口" field="port" rules={[{ required: true }]}>
        <Input defaultValue="22" />
      </FormItem>
      <FormItem label="账号" field="username" rules={[{ required: true }]}>
        <Input />
      </FormItem>
      <FormItem label="密码" field="password">
        <Input />
      </FormItem>
      <FormItem label="私钥" field="privateKey">
        <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
      </FormItem>
      <FormItem label="口令" field="passphrase">
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

export default SFtpForm;
