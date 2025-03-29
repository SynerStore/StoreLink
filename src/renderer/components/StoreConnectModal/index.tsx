import { Fragment, useState } from 'react';
import { Modal } from '@arco-design/web-react';

import StoreSelection from './StoreSelection';
import StoreConnectForm from './StoreConnectForm';
import './index.css';

export type StoreConnectModalProps = {
  children?: React.ReactNode;
  onAddConnection?: (v: any) => void;
};

const StoreConnectModal = (props: StoreConnectModalProps) => {
  const { children, onAddConnection } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState('');
  const [step, setStep] = useState(0);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = () => {};
  return (
    <Fragment>
      <Modal
        title="添加连接"
        closable={false}
        maskClosable={false}
        visible={isModalOpen}
        style={{ width: 720 }}
        onCancel={step === 0 ? handleCancel : handlePrev}
        onOk={step === 0 ? handleNext : handleOk}
        cancelText={step === 0 ? '取消' : '上一步'}
        okText={step === 0 ? '下一步' : '确定'}
      >
        {step === 0 ? (
          <StoreSelection activeBrand={activeBrand} onActive={setActiveBrand} />
        ) : (
          <StoreConnectForm brand={activeBrand} />
        )}
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default StoreConnectModal;
