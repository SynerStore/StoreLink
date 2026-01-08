import { useImperativeHandle, forwardRef, useEffect } from 'react';
import { Form, Input, Button, Switch } from 'antd';
import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes, StoreBrands } from '@/types';
import { useConfigStore } from '@/renderer/store';
import { SecurePasswordInput } from '@/renderer/components';
import { useTranslation } from 'react-i18next';

const FormItem = Form.Item;

type Props = { mode?: 'create' | 'edit'; initial?: any; onSubmit?: (conn: any) => Promise<any> | any };
const SynologyForm = forwardRef((props: Props, ref) => {
  const [form] = Form.useForm();
  const { loading, setLoading } = useLoading();
  const { addConnection } = useConfigStore();
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
        address: initial.config.address,
        username: initial.config.username,
        useHttps: initial.config.useHttps,
        port: initial.config.port,
      });
    }
  }, [initial]);

  const handleTest = async () => {
    setLoading(true);
    const res =
      (form?.validateFields
        ? await form.validateFields(['address', 'username', 'password'])
        : form.getFieldsValue(true)) || {};
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
      <FormItem label={t('connection.name')} name="name">
        <Input />
      </FormItem>
      <FormItem label={t('connection.address')} name="address" rules={[{ required: true }]}>
        <Input placeholder={t('connection.addressPlaceholder')} />
      </FormItem>
      <FormItem label={t('connection.username')} name="username" rules={[{ required: true }]}>
        <Input />
      </FormItem>
      <FormItem label={t('connection.password')} name="password" rules={[{ required: true }]}>
        <SecurePasswordInput mode={mode} maskedLength={initial?.config?.password?.length} maskChar="*" />
      </FormItem>
      <FormItem label={t('connection.enableHttps')} name="useHttps" valuePropName="checked" initialValue={true}>
        <Switch />
      </FormItem>
      <FormItem label={t('connection.port')} name="port" initialValue={5001}>
        <Input />
      </FormItem>
      <FormItem wrapperCol={{ offset: 5 }}>
        <Button type="primary" size="small" onClick={handleTest} loading={loading}>
          {t('connection.testConnection')}
        </Button>
      </FormItem>
    </Form>
  );
});

export default SynologyForm;
