import React, { Fragment } from 'react';
import { Modal } from '@arco-design/web-react';

export type FileRenameWrapProps = {
  connection: { key: string; label: string };
  onDelete: (connection: any) => Promise<void>;
  children?: React.ReactNode;
};
const ConnectionDeleteWrap: React.FC<FileRenameWrapProps> = (props: FileRenameWrapProps) => {
  const { connection, children, onDelete } = props;

  const handleConfirm = () => {
    Modal.confirm({
      title: '删除',
      content: (
        <div>
          <h4> 删除操作不能恢复，确定删除选中的连接吗？</h4>
          <div> 删除链接：{connection.label}</div>
        </div>
      ),
      okText: '确定',
      cancelText: '取消',
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
