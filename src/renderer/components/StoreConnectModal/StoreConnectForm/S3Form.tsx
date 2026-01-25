import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Form, Input, Button, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes } from '@/types';
import { useConfigStore } from '@/renderer/store';
import { SecurePasswordInput } from '@/renderer/components';

const FormItem = Form.Item;
const Option = Select.Option;

type Props = { mode?: 'create' | 'edit'; initial?: any; onSubmit?: (conn: any) => Promise<any> | any };
const S3Form = forwardRef((props: Props, ref) => {
  const [form] = Form.useForm();
  const [buckets, setBuckets] = useState([]);
  const { addConnection } = useConfigStore();
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
        name: initial.name,
        endpoint: initial.config.endpoint,
        bucketName: initial.config.bucketName ? [initial.config.bucketName] : [],
      });
    }
  }, [initial]);
  const handleTest = async () => {
    setLoading(true);
    const res =
      (form?.validateFields
        ? await form.validateFields(['endpoint', 'accessKeyId', 'secretAccessKey'])
        : form.getFieldsValue(true)) || {};
    const result = await storeConnect({
      type: StoreTypes.S3,
      config: {
        accessKeyId: res.accessKeyId ?? initial?.config?.accessKeyId,
        secretAccessKey: res.secretAccessKey ?? initial?.config?.secretAccessKey,
        endpoint: res.endpoint ?? initial?.config?.endpoint,
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
    const res = (form?.validateFields ? await form.validateFields() : form.getFieldsValue(true)) || {};
    // Ensure bucketName is an array
    const bucketNames = Array.isArray(res.bucketName) ? res.bucketName : [res.bucketName];

    const connections = bucketNames.map((item: any) => {
      const bucket: any = buckets.find((bucket: any) => bucket.name === item);
      return {
        id: initial?.id,
        type: StoreTypes.S3,
        brand: 's3',
        name: res.name || bucket?.name || item,
        config: {
          accessKeyId: res.accessKeyId ?? initial?.config?.accessKeyId,
          secretAccessKey: res.secretAccessKey ?? initial?.config?.secretAccessKey,
          endpoint: res.endpoint ?? initial?.config?.endpoint,
          bucketName: bucket?.name || item,
          region: bucket?.region,
        },
      };
    });
    if (mode === 'edit' && onSubmit) {
      return onSubmit(connections[0]);
    }
    return addConnection(connections);
  };

  return (
    <Form form={form} validateTrigger="onBlur" autoComplete="off" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
      <FormItem label={t('connection.name')} name="name">
        <Input placeholder={t('connection.name')} />
      </FormItem>
      <FormItem label="Endpoint" name="endpoint" tooltip="可选，默认为 AWS S3">
        <Input placeholder="https://s3.amazonaws.com" />
      </FormItem>
      <FormItem label="Access Key" name="accessKeyId" rules={[{ required: true, message: t('common.fieldRequired', { field: 'Access Key' }) }]}>
        <Input placeholder="Access Key" />
      </FormItem>
      <FormItem
        label="Secret Key"
        name="secretAccessKey"
        rules={[{ required: !(mode === 'edit' && !!initial?.config?.secretAccessKey), message: t('common.fieldRequired', { field: 'Secret Key' }) }]}
      >
        <SecurePasswordInput
          mode={mode}
          maskedLength={initial?.config?.secretAccessKey?.length}
          maskChar="*"
          placeholder="Secret Key"
        />
      </FormItem>
      <FormItem label="Bucket Name" name="bucketName" extra={t('connection.bucketFillHint')}>
        <Select allowClear mode="tags" placeholder="Bucket Name">
          {buckets.map((bucket: any) => (
            <Option key={bucket.name} value={bucket.name}>
              {bucket.name}
            </Option>
          ))}
        </Select>
      </FormItem>

      <FormItem wrapperCol={{ offset: 5 }}>
        <Button type="primary" size="small" onClick={handleTest} loading={loading}>
          {t('connection.testConnection')}
        </Button>
      </FormItem>
    </Form>
  );
});

export default S3Form;
