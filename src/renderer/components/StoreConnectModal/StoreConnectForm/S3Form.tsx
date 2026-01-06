import { useState, useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Button, Select } from 'antd';

import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes } from '@/types';
import { useConfigStore } from '@/renderer/store';

const FormItem = Form.Item;
const Option = Select.Option;

const S3Form = forwardRef((_props, ref) => {
  const [form] = Form.useForm();
  const [buckets, setBuckets] = useState([]);
  const { addConnection } = useConfigStore();
  const { loading, setLoading } = useLoading();

  useImperativeHandle(ref, () => {
    return {
      onConfirm: handleConfirm,
    };
  });

  const handleTest = async () => {
    setLoading(true);
    const res = await form.validateFields();
    const result = await storeConnect({
      type: StoreTypes.S3,
      config: {
        accessKeyId: res.accessKeyId,
        secretAccessKey: res.secretAccessKey,
        endpoint: res.endpoint,
      },
    });
    setLoading(false);
    if (result.success) {
      const bucketsData = result.data || [];
      setBuckets(bucketsData);
      if (bucketsData.length) {
        form.setFieldsValue({
          bucketName: bucketsData.map((item: any) => item.name),
        });
      }
    }
  };

  const handleConfirm = async () => {
    const res = await form.validateFields();
    // Ensure bucketName is an array
    const bucketNames = Array.isArray(res.bucketName) ? res.bucketName : [res.bucketName];

    const connections = bucketNames.map((item: any) => {
      const bucket: any = buckets.find((bucket: any) => bucket.name === item);
      return {
        type: StoreTypes.S3,
        brand: 's3',
        name: bucket?.name || item,
        config: {
          accessKeyId: res.accessKeyId,
          secretAccessKey: res.secretAccessKey,
          endpoint: res.endpoint,
          bucketName: bucket?.name || item,
          region: bucket?.region,
        },
      };
    });
    const newCons = await addConnection(connections);
    return newCons;
  };

  return (
    <Form form={form} autoComplete="off" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
      <FormItem label="Endpoint" name="endpoint" tooltip="可选，默认为 AWS S3">
        <Input placeholder="https://s3.amazonaws.com" />
      </FormItem>
      <FormItem label="Access Key" name="accessKeyId" rules={[{ required: true }]}>
        <Input />
      </FormItem>
      <FormItem label="Secret Key" name="secretAccessKey" rules={[{ required: true }]}>
        <Input.Password />
      </FormItem>
      <FormItem
        label="Bucket Name"
        name="bucketName"
        extra="点击连接测试自动填充账号下的 Bucket"
      >
        <Select allowClear mode="tags">
          {buckets.map((bucket: any) => (
            <Option key={bucket.name} value={bucket.name}>
              {bucket.name}
            </Option>
          ))}
        </Select>
      </FormItem>

      <FormItem wrapperCol={{ offset: 5 }}>
        <Button type="primary" size="small" onClick={handleTest} loading={loading}>
          连接测试
        </Button>
      </FormItem>
    </Form>
  );
});

export default S3Form;
