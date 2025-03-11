import React, { Fragment } from 'react';
import { Modal } from '@arco-design/web-react';

export type FileRenameWrapProps = {
  fileInfo: any;
  onDelete: (fileInfo: any) => Promise<void>;
  children?: React.ReactNode;
};
const FileDeteleWrap: React.FC<FileRenameWrapProps> = (props: FileRenameWrapProps) => {
  const { fileInfo, children, onDelete } = props;

  const handleConfirm = () => {
    Modal.confirm({
      title: '删除',
      content: (
        <div>
          <h4> 删除操作不能恢复，确定删除选中的文件或文件夹吗？</h4>
          <div> 删除对象：{fileInfo.name}</div>
        </div>
      ),
      okText: '确定',
      cancelText: '取消',
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
