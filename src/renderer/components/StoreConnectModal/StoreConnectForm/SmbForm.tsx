import { useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Button } from '@arco-design/web-react';

import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes, StoreBrands } from '@/types';
import { useConfigStore } from '@/renderer/store';

const FormItem = Form.Item;

const SmbForm = forwardRef((_props, ref) => {
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
      type: StoreTypes.SMB,
      config: {
        address: res.address,
        username: res.username,
        password: res.password,
      },
    });
    console.log(result);
    setLoading(false);
  };

  const handleConfirm = async () => {
    const res = await form.validate();
    const connection = {
      type: StoreTypes.SMB,
      brand: StoreBrands.SMB,
      name: res.address,
      config: {
        address: res.address,
        username: res.username,
        password: res.password,
      },
    };
    // 判断是否存在
    const newCons = await addConnection(connection);
    return newCons;
  };
  return (
    <Form form={form} style={{ width: 600 }} autoComplete="off">
      <FormItem label="服务器地址" field="address">
        <Input />
      </FormItem>
      <FormItem label="账号" field="username">
        <Input />
      </FormItem>
      <FormItem label="密码" field="password">
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

export default SmbForm;
