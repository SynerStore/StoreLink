import React, { Fragment, useState } from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

export type FileRenameWrapProps = {
  fileInfo: any;
  onDelete: (fileInfo: any) => Promise<void>;
  children?: React.ReactNode;
};
const FileDeteleWrap: React.FC<FileRenameWrapProps> = (props: FileRenameWrapProps) => {
  const { fileInfo, children, onDelete } = props;
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onDelete(fileInfo);
    setIsModalOpen(false);
  };

  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  return (
    <Fragment>
      <Modal
        title={t('contextMenu.delete')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        closable={false}
        maskClosable={false}
      >
        <div>
          <h4>{t('common.deleteWarning')}</h4>
          <div>
            {t('common.name')}: {fileInfo.name}
          </div>
        </div>
      </Modal>
      <span onClick={handleOpen}>{children}</span>
    </Fragment>
  );
};

export default FileDeteleWrap;
