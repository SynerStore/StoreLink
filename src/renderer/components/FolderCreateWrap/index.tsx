import { Fragment, useState } from 'react';
import { Modal, Form, Input } from 'antd';

export type FolderCreateWrapProps = {
  onCreateFolder: (val: string) => void;
  children?: React.ReactNode;
};
const FileRenameWrap = (props: FolderCreateWrapProps) => {
  const { onCreateFolder, children } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onCreateFolder(values.folderName);
      setIsModalOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Fragment>
      <Modal
        title="新建目录"
        closable={false}
        maskClosable={false}
        style={{ width: 520 }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form initialValues={{ folderName: '' }} form={form}>
          <Form.Item label="目录名称" name="folderName" rules={[{ required: true, message: '请输入目录名称!' }]}>
            <Input placeholder="请输入目录名称" />
          </Form.Item>
        </Form>
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default FileRenameWrap;
