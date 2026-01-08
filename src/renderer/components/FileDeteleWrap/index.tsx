import React, { Fragment } from 'react';
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

  const handleConfirm = () => {
    Modal.confirm({
      title: t('contextMenu.delete'),
      content: (
        <div>
          <h4>{t('common.deleteWarning')}</h4>
          <div>
            {t('common.name')}: {fileInfo.name}
          </div>
        </div>
      ),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      closable: false,
      maskClosable: false,
      onOk: () => {
        onDelete(fileInfo);
      },
    });
  };

  return (
    <Fragment>
      <span onClick={handleConfirm}>{children}</span>
    </Fragment>
  );
};

export default FileDeteleWrap;
