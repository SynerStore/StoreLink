import React from 'react';
import { Modal, Descriptions, Typography, Badge, Collapse } from 'antd';
import { useTranslation } from 'react-i18next';
import { ETaskStatus } from '@/types';
import dayjs from 'dayjs';
import { calculateSize } from '@/renderer/utils';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface TaskDetailModalProps {
  open: boolean;
  onCancel: () => void;
  task: any;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ open, onCancel, task }) => {
  const { t } = useTranslation();

  if (!task) return null;

  const duration =
    task.startTime && task.endTime ? dayjs(task.endTime).diff(dayjs(task.startTime), 'millisecond') : null;

  const getStatusBadge = (status: ETaskStatus) => {
    switch (status) {
      case ETaskStatus.COMPLETED:
        return <Badge status="success" text={t(`tasks.${status}`)} />;
      case ETaskStatus.FAILED:
        return <Badge status="error" text={t(`tasks.${status}`)} />;
      case ETaskStatus.RUNNING:
        return <Badge status="processing" text={t(`tasks.${status}`)} />;
      case ETaskStatus.PAUSED:
        return <Badge status="warning" text={t(`tasks.${status}`)} />;
      default:
        return <Badge status="default" text={t(`tasks.${status}`)} />;
    }
  };

  return (
    <Modal title={t('tasks.detail.title')} open={open} onCancel={onCancel} footer={null} width={800}>
      <Descriptions bordered column={2}>
        <Descriptions.Item label={t('tasks.detail.taskId')} span={2}>
          <Text copyable>{task.taskId}</Text>
        </Descriptions.Item>
        <Descriptions.Item label={t('common.type')}>{task.type}</Descriptions.Item>
        <Descriptions.Item label={t('tasks.status')}>{getStatusBadge(task.status)}</Descriptions.Item>
        <Descriptions.Item label={t('common.size')}>
          {calculateSize(task.size)} ({task.size} B)
        </Descriptions.Item>
        <Descriptions.Item label={t('tasks.detail.duration')}>{duration ? `${duration} ms` : '-'}</Descriptions.Item>
        <Descriptions.Item label={t('tasks.detail.startTime')}>
          {task.startTime ? dayjs(task.startTime).format('YYYY-MM-DD HH:mm:ss.SSS') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('tasks.detail.endTime')}>
          {task.endTime ? dayjs(task.endTime).format('YYYY-MM-DD HH:mm:ss.SSS') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('tasks.detail.createTime')}>
          {task.createTime ? dayjs(task.createTime).format('YYYY-MM-DD HH:mm:ss.SSS') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('tasks.detail.connectionId')}>{task.connectionId}</Descriptions.Item>
      </Descriptions>

      {task.errorMessage && (
        <div style={{ marginTop: 16 }}>
          <Typography.Title level={5} type="danger">
            {t('tasks.detail.error')}
          </Typography.Title>
          <Paragraph type="danger">
            <Text strong>{task.errorMessage}</Text>
          </Paragraph>
          {task.errorStack && (
            <Collapse ghost>
              <Panel header={t('tasks.detail.stackTrace')} key="1">
                <Paragraph>
                  <pre style={{ maxHeight: 200, overflow: 'auto', fontSize: 12 }}>{task.errorStack}</pre>
                </Paragraph>
              </Panel>
            </Collapse>
          )}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Typography.Title level={5}>{t('tasks.detail.rawParams')}</Typography.Title>
        <div
          style={{
            backgroundColor: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            maxHeight: 300,
            overflow: 'auto',
          }}
        >
          <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(task.params, null, 2)}</pre>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
