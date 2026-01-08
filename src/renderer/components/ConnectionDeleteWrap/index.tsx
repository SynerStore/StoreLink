import React, { Fragment } from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

export type FileRenameWrapProps = {
  connection: { key: string; label: string };
  onDelete: (connection: any) => Promise<void>;
  children?: React.ReactNode;
};
const ConnectionDeleteWrap: React.FC<FileRenameWrapProps> = (props: FileRenameWrapProps) => {
  const { connection, children, onDelete } = props;
  const { t } = useTranslation();
  const handleConfirm = () => {
    Modal.confirm({
      title: t('storeSider.deleteConnection'),
      content: (
        <div>
          <h4>{t('common.deleteWarning')}</h4>
          <div>
            {t('connection.name')}: {connection.label}
          </div>
        </div>
      ),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      closable: false,
      maskClosable: false,
      onOk: () => {
        onDelete(connection);
      },
    });
  };

  return (
    <Fragment>
      <span onClick={handleConfirm}>{children}</span>
    </Fragment>
  );
};

export default ConnectionDeleteWrap;
