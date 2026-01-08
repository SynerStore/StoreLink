import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Form, Input, Button, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes, StoreConnectStatus } from '@/types';
import { useConfigStore } from '@/renderer/store';
import { SecurePasswordInput } from '@/renderer/components';

const FormItem = Form.Item;
const Option = Select.Option;

type Props = { mode?: 'create' | 'edit'; initial?: any; onSubmit?: (conn: any) => Promise<any> | any };
const OssForm = forwardRef((props: Props, ref) => {
  const [form] = Form.useForm();
  const [buckets, setBuckets] = useState([]);
  const { addConnection } = useConfigStore();
  const [connectStatus, setConnectStatus] = useState<StoreConnectStatus>(StoreConnectStatus.unexec);
  const { loading, setLoading } = useLoading();
  const { mode = 'create', initial, onSubmit } = props;
  const { t } = useTranslation();

  useImperativeHandle(ref, () => {
    return {
      onConfirm: handleConfirm,
    };
  });

  useEffect(() => {
    if (initial?.config) {
      form.setFieldsValue({
        accessKeyId: initial.config.accessKeyId,
        secretAccessKey: initial.config.secretAccessKey,
        bucketName: initial.config.bucketName ? [initial.config.bucketName] : [],
      });
    }
  }, [initial]);
  const handleTest = async () => {
    setLoading(true);
    const res =
      (form?.validateFields
        ? await form.validateFields(['accessKeyId', 'secretAccessKey'])
        : form.getFieldsValue(true)) || {};
    const result = await storeConnect({
      type: StoreTypes.OSS,
      config: {
        accessKeyId: res.accessKeyId ?? initial?.config?.accessKeyId,
        secretAccessKey: res.secretAccessKey ?? initial?.config?.secretAccessKey,
      },
    });
    const bucketsData = result.data;
    setBuckets(bucketsData);
    setLoading(false);

    if (bucketsData.length) {
      form.setFieldsValue({
        bucketName: bucketsData.map((item: any) => item.name),
      });
    }
  };
  // 确认
  const handleConfirm = async () => {
    const res = (form?.validateFields ? await form.validateFields() : form.getFieldsValue(true)) || {};
    const connections = res.bucketName.map((item: any) => {
      const bucket: any = buckets.find((bucket: any) => bucket.name === item);
      return {
        id: initial?.id,
        type: StoreTypes.OSS,
        brand: 'aliyun',
        name: res.name || bucket?.name || item,
        config: {
          accessKeyId: res.accessKeyId ?? initial?.config?.accessKeyId,
          secretAccessKey: res.secretAccessKey ?? initial?.config?.secretAccessKey,
          bucketName: bucket?.name || item,
          region: bucket?.region,
        },
      };
    });
    if (mode === 'edit' && onSubmit) {
      // 编辑场景仅编辑当前连接，取第一项
      return onSubmit(connections[0]);
    }
    return addConnection(connections);
  };

  return (
    <Form form={form} autoComplete="off">
      <FormItem label={t('connection.name')} name="name">
        <Input />
      </FormItem>
      <FormItem label="Access Key" name="accessKeyId" rules={[{ required: true }]}>
        <Input />
      </FormItem>
      <FormItem
        label="Secret Key"
        name="secretAccessKey"
        rules={[{ required: !(mode === 'edit' && !!initial?.config?.secretAccessKey) }]}
      >
        <SecurePasswordInput mode={mode} maskedLength={initial?.config?.secretAccessKey?.length} maskChar="*" />
      </FormItem>
      <FormItem
        label="Bucket Name"
        name="bucketName"
        extra={t('connection.bucketFillHint')}
        tooltip={t('connection.bucketMultipleHint')}
      >
        <Select allowClear mode="tags">
          {buckets.map((bucket: any) => (
            <Option key={bucket.name} value={bucket.name}>
              {bucket.name}
            </Option>
          ))}
        </Select>
      </FormItem>
      <FormItem>
        <Button type="primary" size="small" onClick={handleTest} loading={loading}>
          {t('connection.testConnection')}
        </Button>
        {/* <span>成功</span> */}
      </FormItem>
    </Form>
  );
});

export default OssForm;
