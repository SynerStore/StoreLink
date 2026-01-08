import { Fragment, useMemo, useRef, useState } from 'react';
import { Modal } from 'antd';
import StoreConnectForm from '@/renderer/components/StoreConnectModal/StoreConnectForm';
import { useConfigStore } from '@/renderer/store';
import { useTranslation } from 'react-i18next';

export type ConnectionEditWrapProps = {
  connection: { key: string; label: string };
  children?: React.ReactNode;
  onUpdated?: (v: any) => void;
};

const ConnectionEditWrap = (props: ConnectionEditWrapProps) => {
  const { connection, children, onUpdated } = props;
  const formRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const { connections, updateConnection, initializeData } = useConfigStore();
  const { t } = useTranslation();

  const target = useMemo(() => {
    return connections.find((c: any) => c.id === connection.key);
  }, [connections, connection?.key]);

  const handleOk = async () => {
    const payload = await formRef.current?.onConfirm?.();
    if (payload) {
      await updateConnection(payload);
      await initializeData();
      onUpdated?.(payload);
      setOpen(false);
    }
  };

  return (
    <Fragment>
      <Modal
        title={t('storeSider.editConnection')}
        closable={false}
        maskClosable={false}
        open={open}
        centered
        width={620}
        onCancel={() => setOpen(false)}
        onOk={handleOk}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
      >
        {target ? <StoreConnectForm brand={target.brand} mode="edit" initial={target} ref={formRef} /> : null}
      </Modal>
      <span onClick={() => setOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default ConnectionEditWrap;
