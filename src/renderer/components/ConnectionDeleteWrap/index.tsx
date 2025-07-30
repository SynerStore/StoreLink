import React, { Fragment } from 'react';
import { Modal } from '@arco-design/web-react';
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
      title: t('common.delete'),
      content: (
        <div>
          <h4> 删除操作不能恢复，确定删除选中的连接吗？</h4>
          <div> 删除链接：{connection.label}</div>
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
