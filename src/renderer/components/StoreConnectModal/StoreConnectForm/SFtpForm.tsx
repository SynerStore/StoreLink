import { useImperativeHandle, forwardRef, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLoading } from '@/renderer/hooks';
import { storeConnect } from '@/renderer/utils';
import { StoreTypes, StoreBrands } from '@/types';
import { useConfigStore } from '@/renderer/store';
import { SecurePasswordInput } from '@/renderer/components';
const FormItem = Form.Item;

type Props = { mode?: 'create' | 'edit'; initial?: any; onSubmit?: (conn: any) => Promise<any> | any };
const SFtpForm = forwardRef((props: Props, ref) => {
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
        host: initial.config.host,
        port: initial.config.port,
        username: initial.config.username,
      });
    }
  }, [initial]);
  const handleTest = async () => {
    setLoading(true);
    const res =
      (form?.validateFields
        ? await form.validateFields(['host', 'port', 'username', 'password', 'privateKey', 'passphrase'])
        : form.getFieldsValue(true)) || {};
    const result = await storeConnect({
      type: StoreTypes.SFTP,
      config: {
        host: res.host,
        port: Number(res.port || 22),
        username: res.username,
        password: res.password ?? initial?.config?.password,
        privateKey: res.privateKey ?? initial?.config?.privateKey,
        passphrase: res.passphrase ?? initial?.config?.passphrase,
      },
    });
    console.log(result);
    setLoading(false);
  };

  const handleConfirm = async () => {
    const res = await form.validateFields();
    const connection = {
      id: initial?.id,
      type: StoreTypes.SFTP,
      brand: StoreBrands.sftp,
      name: res.name || res.host,
      config: {
        port: Number(res.port || 22),
        username: res.username,
        password: res.password ?? initial?.config?.password,
        privateKey: res.privateKey ?? initial?.config?.privateKey,
        passphrase: res.passphrase ?? initial?.config?.passphrase,
      },
    };
    if (mode === 'edit' && onSubmit) {
      return onSubmit(connection);
    }
    return addConnection(connection);
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
        label={t('connection.host')}
        name="host"
        rules={[{ required: true, message: t('common.fieldRequired', { field: t('connection.host') }) }]}
      >
        <Input placeholder={t('connection.host')} />
      </FormItem>
      <FormItem
        label={t('connection.port')}
        name="port"
        rules={[{ required: true, message: t('common.fieldRequired', { field: t('connection.port') }) }]}
        initialValue="22"
      >
        <Input placeholder={t('connection.port')} />
      </FormItem>
      <FormItem
        label={t('connection.username')}
        name="username"
        rules={[{ required: true, message: t('common.fieldRequired', { field: t('connection.username') }) }]}
      >
        <Input placeholder={t('connection.username')} />
      </FormItem>
      <FormItem label={t('connection.password')} name="password">
        <SecurePasswordInput
          mode={mode}
          maskedLength={initial?.config?.password?.length}
          maskChar="*"
          placeholder={t('connection.password')}
        />
      </FormItem>
      <FormItem label={t('connection.privateKey')} name="privateKey">
        <SecurePasswordInput
          mode={mode}
          multiline
          maskedLength={initial?.config?.privateKey?.length}
          maskChar="*"
          placeholder={t('connection.privateKey')}
        />
      </FormItem>
      <FormItem label={t('connection.passphrase')} name="passphrase">
        <SecurePasswordInput
          mode={mode}
          maskedLength={initial?.config?.passphrase?.length}
          maskChar="*"
          placeholder={t('connection.passphrase')}
        />
      </FormItem>
      <FormItem wrapperCol={{ offset: 5 }}>
        <Button type="primary" size="small" onClick={handleTest} loading={loading}>
          {t('connection.testConnection')}
        </Button>
      </FormItem>
    </Form>
  );
});

export default SFtpForm;
