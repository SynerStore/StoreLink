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
const CosForm = forwardRef((props: Props, ref) => {
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
        accessKeyId: initial.config.accessKeyId,
        secretAccessKey: initial.config.secretAccessKey,
        bucketName: initial.config.bucketName ? [initial.config.bucketName] : [],
      });
    }
  }, [initial]);

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await form.validateFields(['accessKeyId', 'secretAccessKey']);
      const result = await storeConnect({
        type: StoreTypes.COS,
        config: {
          accessKeyId: res.accessKeyId ?? initial?.config?.accessKeyId,
          secretAccessKey: res.secretAccessKey ?? initial?.config?.secretAccessKey,
        },
      });
      const bucketsData = result.data;
      setBuckets(bucketsData || []);

      if (bucketsData && bucketsData.length) {
        form.setFieldsValue({
          bucketName: bucketsData.map((item: any) => item.name),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 确认
  const handleConfirm = async () => {
    const res = await form.validateFields();
    const connections = res.bucketName.map((item: any) => {
      const bucket: any = buckets.find((bucket: any) => bucket.name === item);
      let connectionName = res.name || bucket?.name || item;
      if (res.name && res.bucketName.length > 1) {
        connectionName = `${res.name}-${item}`;
      }
      return {
        id: initial?.id,
        type: StoreTypes.COS,
        brand: 'tencentcloud',
        name: connectionName,
        config: {
          accessKeyId: res.accessKeyId ?? initial?.config?.accessKeyId,
          secretAccessKey: res.secretAccessKey ?? initial?.config?.secretAccessKey,
          bucketName: bucket?.name || item,
          region: bucket?.region || initial?.config?.region,
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
    <Form form={form} validateTrigger="onBlur" autoComplete="off" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
      <FormItem
        label={t('connection.name')}
        name="name"
        rules={[{ required: true, message: t('common.fieldRequired', { field: t('connection.name') }) }]}
      >
        <Input placeholder={t('connection.name')} />
      </FormItem>
      <FormItem
        label="Secret Id"
        name="accessKeyId"
        rules={[{ required: true, message: t('common.fieldRequired', { field: 'Secret Id' }) }]}
      >
        <Input placeholder="Secret Id" />
      </FormItem>
      <FormItem
        label="Secret Key"
        name="secretAccessKey"
        rules={[
          {
            required: !(mode === 'edit' && !!initial?.config?.secretAccessKey),
            message: t('common.fieldRequired', { field: 'Secret Key' }),
          },
        ]}
      >
        <SecurePasswordInput
          mode={mode}
          maskedLength={initial?.config?.secretAccessKeyLength || initial?.config?.secretAccessKey?.length}
          maskChar="*"
          placeholder="Secret Key"
        />
      </FormItem>
      <FormItem
        label="Bucket Name"
        name="bucketName"
        extra={t('connection.bucketFillHint')}
        tooltip={t('connection.bucketMultipleHint')}
      >
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

export default CosForm;
