import { useState, useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Button, Select } from '@arco-design/web-react';

import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes, StoreConnectStatus } from '@/types';
import { useConfigStore } from '@/renderer/store';

const FormItem = Form.Item;
const Option = Select.Option;

const OssForm = forwardRef((_props, ref) => {
  const [form] = Form.useForm();
  const [buckets, setBuckets] = useState([]);
  const { addConnection } = useConfigStore();
  const [connectStatus, setConnectStatus] = useState<StoreConnectStatus>(StoreConnectStatus.unexec);
  const { loading, setLoading } = useLoading();

  useImperativeHandle(ref, () => {
    return {
      onConfirm: handleConfirm,
    };
  });

  const handleTest = async () => {
    setLoading(true);
    const res = await form.validate();
    const result = await storeConnect({
      type: StoreTypes.OSS,
      config: {
        accessKeyId: res.accessKeyId,
        secretAccessKey: res.secretAccessKey,
      },
    });
    const bucketsData = result.data;
    setBuckets(bucketsData);
    setLoading(false);

    if (bucketsData.length) {
      form.setFieldValue(
        'bucketName',
        bucketsData.map((item: any) => item.name),
      );
    }
  };
  // 确认
  const handleConfirm = async () => {
    const res = await form.validate();
    const connections = res.bucketName.map((item: any) => {
      const bucket: any = buckets.find((bucket: any) => bucket.name === item);
      return {
        type: StoreTypes.OSS,
        brand: 'aliyun',
        name: bucket.name,
        config: {
          accessKeyId: res.accessKeyId,
          secretAccessKey: res.secretAccessKey,
          bucketName: bucket.name,
          region: bucket.region,
        },
      };
    });
    // 判断是否存在
    const newCons = await addConnection(connections);
    return newCons;
  };

  return (
    <Form form={form} autoComplete="off">
      <FormItem label="Access Key" field="accessKeyId" rules={[{ required: true }]}>
        <Input />
      </FormItem>
      <FormItem label="Secret Key" field="secretAccessKey" rules={[{ required: true }]}>
        <Input />
      </FormItem>
      <FormItem
        label="Bucket Name"
        field="bucketName"
        extra="点击连接测试自动填充账号下的 Bucket"
        tooltip="可以输入多个Bucket"
      >
        <Select allowClear allowCreate mode="multiple">
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
        {/* <span>成功</span> */}
      </FormItem>
    </Form>
  );
});

export default OssForm;
