import React from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { CopyOutlined, BugOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useErrorStore } from '@/renderer/store';
import { copyToClipboard } from '@/renderer/utils';

const { Paragraph, Text } = Typography;

const ErrorModal: React.FC = () => {
  const { visible, error, hideError } = useErrorStore();
  const { t } = useTranslation();

  const handleCopy = () => {
    if (!error) return;
    const text = `Error: ${error.message}\n\nDetails: ${error.details || ''}\n\nStack: ${error.stack || ''}`;
    copyToClipboard(text);
  };

  if (!error) return null;

  return (
    <Modal
      open={visible}
      onCancel={hideError}
      footer={[
        <Button key="copy" icon={<CopyOutlined />} onClick={handleCopy}>
          {t('common.copyError', 'Copy Error')}
        </Button>,
        <Button key="close" type="primary" onClick={hideError}>
          {t('common.close', 'Close')}
        </Button>,
      ]}
      title={
        <Space>
          <BugOutlined style={{ color: '#ff4d4f' }} />
          <span>{error.title || t('common.error', 'Error')}</span>
        </Space>
      }
      width={600}
      centered
    >
      <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
        <Paragraph>
          <Text strong type="danger">
            {error.message}
          </Text>
        </Paragraph>
        
        {error.details && (
          <Paragraph>
            <Text type="secondary">{error.details}</Text>
          </Paragraph>
        )}

        {error.stack && (
          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: 'pointer', color: '#8c8c8c' }}>Stack Trace</summary>
            <pre
              style={{
                marginTop: 8,
                padding: 12,
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
                fontSize: 12,
                overflow: 'auto',
                border: '1px solid #d9d9d9',
              }}
            >
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </Modal>
  );
};

export default ErrorModal;
