import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { TStoreObject } from '@/types';

export interface FileMoveConfirmModalProps {
  open: boolean;
  sourceFiles: TStoreObject[];
  targetFolder: TStoreObject | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const FileMoveConfirmModal: React.FC<FileMoveConfirmModalProps> = (props) => {
  const { open, sourceFiles, targetFolder, onConfirm, onCancel } = props;
  const { t } = useTranslation();

  if (!targetFolder || sourceFiles.length === 0) return null;

  return (
    <Modal
      title={t('common.move')}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      closable={false}
      maskClosable={false}
      centered
    >
      <div>
        <h4>{t('common.moveWarning')}</h4>
        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
          <div>
            <strong>{t('common.source')}:</strong>
            <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
              {sourceFiles.map((file) => (
                <li key={file.key as React.Key}>{file.name}</li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: '10px' }}>
            <strong>{t('common.target')}:</strong> {targetFolder.name}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FileMoveConfirmModal;
