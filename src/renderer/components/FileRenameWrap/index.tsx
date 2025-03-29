import React, { Fragment, useState } from 'react';
import { Modal, Form, Input } from '@arco-design/web-react';

export type FileRenameWrapProps = {
  onRename: (val: string) => void;
  name: string;
  children?: React.ReactNode;
};
const FileRenameWrap: React.FC<FileRenameWrapProps> = (props: FileRenameWrapProps) => {
  const { name, onRename, children } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const handleOk = async () => {
    // 空值校验、重复名称校验等
    try {
      const values = await form.validate();
      onRename(values.newName);
      setIsModalOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpen = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Fragment>
      <Modal
        closable={false}
        maskClosable={false}
        title="重命名"
        visible={isModalOpen}
        getPopupContainer={() => document.body}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form initialValues={{ newName: name }} form={form}>
          <Form.Item label="原名称">
            <span> {name} </span>
          </Form.Item>
          <Form.Item label="重命名" field="newName" rules={[{ required: true, message: '请输入重命名!' }]}>
            <Input placeholder="请输入重命名" />
          </Form.Item>
        </Form>
      </Modal>
      <span onClick={handleOpen}>{children}</span>
    </Fragment>
  );
};

export default FileRenameWrap;
