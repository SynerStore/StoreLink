import { Fragment, useState, useRef } from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

import StoreSelection from './StoreSelection';
import StoreConnectForm from './StoreConnectForm';
import { useTabsStore, ETabDisplay } from '@/renderer/store';
import './index.css';

export type StoreConnectModalProps = {
  children?: React.ReactNode;
  onAddConnection?: (v: any) => void;
};
const StoreConnectModal = (props: StoreConnectModalProps) => {
  const { children, onAddConnection } = props;
  const formRef = useRef<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState('');
  const [step, setStep] = useState(0);
  const { addTab } = useTabsStore();
  const { t } = useTranslation();

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = async () => {
    const connections = await formRef.current.onConfirm();
    setIsModalOpen(false);
    debugger
    const activeConnection = connections[0];
    addTab({
      id: activeConnection.id,
      name: activeConnection.name,
      display: ETabDisplay.LIST,
    });
  };

  return (
    <Fragment>
      <Modal
        title={t('storeSider.addConnection')}
        forceRender // 强制渲染，解决首次打开时表单校验不通过的问题
        destroyOnHidden
        maskClosable={false}
        closable={false}
        open={isModalOpen}
        centered
        width={620}
        onCancel={step === 0 ? handleCancel : handlePrev}
        onOk={step === 0 ? handleNext : handleOk}
        cancelText={step === 0 ? t('common.cancel') : t('common.prev')}
        okText={step === 0 ? t('common.next') : t('common.confirm')}
      >
        {step === 0 ? (
          <StoreSelection activeBrand={activeBrand} onActive={setActiveBrand} />
        ) : (
          <StoreConnectForm key={activeBrand} brand={activeBrand} ref={formRef} />
        )}
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default StoreConnectModal;
