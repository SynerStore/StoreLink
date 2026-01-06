import { Fragment, useState, useRef } from 'react';
import { Modal } from 'antd';

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
        title="添加连接"
        closable={false}
        maskClosable={false}
        open={isModalOpen}
        width={620}
        onCancel={step === 0 ? handleCancel : handlePrev}
        onOk={step === 0 ? handleNext : handleOk}
        cancelText={step === 0 ? '取消' : '上一步'}
        okText={step === 0 ? '下一步' : '确定'}
      >
        {step === 0 ? (
          <StoreSelection activeBrand={activeBrand} onActive={setActiveBrand} />
        ) : (
          <StoreConnectForm brand={activeBrand} ref={formRef} />
        )}
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default StoreConnectModal;
