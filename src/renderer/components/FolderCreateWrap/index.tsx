import { Fragment, useState } from 'react';
import { Modal, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

export type FolderCreateWrapProps = {
  onCreateFolder: (val: string) => void;
  children?: React.ReactNode;
};
const FileRenameWrap = (props: FolderCreateWrapProps) => {
  const { onCreateFolder, children } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
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
        title={t('storeViewer.createFolder')}
        closable={false}
        maskClosable={false}
        style={{ width: 520 }}
        open={isModalOpen}
        centered
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form initialValues={{ folderName: '' }} form={form}>
          <Form.Item label={t('common.name')} name="folderName" rules={[{ required: true }]}>
            <Input placeholder={t('storeViewer.createFolder')} />
          </Form.Item>
        </Form>
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default FileRenameWrap;
