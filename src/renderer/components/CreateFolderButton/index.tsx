import { Fragment, useState } from 'react';
import { Modal, Button, Form, Input } from 'antd';

export type CreateFolderButtonProps = {
  onCreateFolder: (val: string) => void;
};
const CreateFolderButton = (props: CreateFolderButtonProps) => {
  const { onCreateFolder } = props;
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
      <Modal title="新建目录" open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
        <Form initialValues={{ folderName: '' }} form={form}>
          <Form.Item label="目录名称" name="folderName" rules={[{ required: true, message: '请输入目录名称!' }]}>
            <Input placeholder="请输入目录名称" />
          </Form.Item>
        </Form>
      </Modal>
      <Button onClick={() => setIsModalOpen(true)}>新建目录</Button>
    </Fragment>
  );
};

export default CreateFolderButton;
