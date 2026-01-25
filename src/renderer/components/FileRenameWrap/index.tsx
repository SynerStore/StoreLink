import React, { Fragment, useState } from 'react';
import { Modal, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

export type FileRenameWrapProps = {
  onRename: (val: string) => void;
  name: string;
  children?: React.ReactNode;
};
const FileRenameWrap: React.FC<FileRenameWrapProps> = (props: FileRenameWrapProps) => {
  const { name, onRename, children } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const handleOk = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    // 空值校验、重复名称校验等
    try {
      const values = await form.validateFields();
      onRename(values.newName);
      setIsModalOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };
  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  return (
    <Fragment>
      <Modal
        title={t('common.rename')}
        closable={false}
        maskClosable={false}
        open={isModalOpen}
        centered
        style={{ width: 520 }}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form initialValues={{ newName: name }} form={form}>
          <Form.Item label={t('common.name')}>
            <span> {name} </span>
          </Form.Item>
          <Form.Item label={t('common.rename')} name="newName" rules={[{ required: true }]}>
            <Input placeholder={t('common.rename')} />
          </Form.Item>
        </Form>
      </Modal>
      <span onClick={handleOpen}>{children}</span>
    </Fragment>
  );
};

export default FileRenameWrap;
