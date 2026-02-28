import { useImperativeHandle, forwardRef, useEffect } from 'react';
import { Form, Input, Button, Switch, App } from 'antd';
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
  const { message } = App.useApp();

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
        password: initial.config.password,
        lanPriority: initial.config.lanPriority ?? true,
      });
    }
  }, [initial]);

  const handleTest = async () => {
    setLoading(true);
    const res = await form.validateFields(['address', 'username', 'password', 'lanPriority']);
    const result = await storeConnect({
      type: StoreTypes.SYNOLOGY,
      config: {
        address: res.address,
        username: res.username,
        password: res.password ?? initial?.config?.password,
        lanPriority: res.lanPriority,
      },
    });
    console.log(result);
    if (result?.success) {
      message.success(t('common.testSuccess'));
    } else {
      message.error(result?.msg || t('common.testFailed'));
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    const res = await form.validateFields();
    const connection = {
      id: initial?.id,
      type: StoreTypes.SYNOLOGY,
      brand: StoreBrands.synology,
      name: res.name || res.server,
      config: {
        address: res.address,
        username: res.username,
        password: res.password,
        lanPriority: res.lanPriority,
      },
    };
    if (mode === 'edit' && onSubmit) {
      return onSubmit(connection);
    }
    return addConnection(connection);
  };

  return (
    <Form
      form={form}
      initialValues={{ lanPriority: true }}
      validateTrigger="onBlur"
      autoComplete="off"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 19 }}
    >
      <FormItem
        label={t('connection.name')}
        name="name"
        rules={[{  required: true, message: t('common.fieldRequired', { field: t('connection.name') }) }]}
      >
        <Input placeholder={t('connection.name')} />
      </FormItem>
      <FormItem
        label={t('connection.address')}
        name="address"
        rules={[{  required: true, message: t('common.fieldRequired', { field: t('connection.address') }) }]}
      >
        <Input placeholder={t('connection.synologyServer')} />
      </FormItem>
      <FormItem
        label={t('connection.username')}
        name="username"
        rules={[{  required: true, message: t('common.fieldRequired', { field: t('connection.username') }) }]}
      >
        <Input placeholder={t('connection.username')} />
      </FormItem>
      <FormItem
        label={t('connection.password')}
        name="password"
        rules={[
          {
            required: !(mode === 'edit' && !!initial?.config?.password),
            message: t('common.fieldRequired', { field: t('connection.password') }),
          },
        ]}
      >
        <SecurePasswordInput
          mode={mode}
          maskedLength={initial?.config?.passwordLength || initial?.config?.password?.length}
          maskChar="*"
          placeholder={t('connection.password')}
        />
      </FormItem>
      <FormItem label={t('connection.lanPriority')} name="lanPriority" valuePropName="checked">
        <Switch />
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
