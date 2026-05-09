import { Button, Space, Table, Progress, Tag, Tooltip, Badge } from 'antd';
import { DeleteOutlined, PauseOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';

import TaskTypeTag from './components/TaskTypeTag';

const RunningTaskTable = () => {
  const { t } = useTranslation();
  const { tasks, handlePause, handleResume, handleDelete, handleRetryAll, pagination, handleTableChange, loading } =
    useTasks(
      [ETaskStatus.RUNNING, ETaskStatus.PAUSED, ETaskStatus.PENDING, ETaskStatus.FAILED, ETaskStatus.CANCELED],
      [],
    );

  const runningCount = tasks.filter((t) => t.status === ETaskStatus.RUNNING || t.status === ETaskStatus.PAUSED).length;
  const failedCount = tasks.filter((t) => t.status === ETaskStatus.FAILED || t.status === ETaskStatus.CANCELED).length;

  const columns = [
    {
      title: t('common.type'),
      dataIndex: 'type',
      width: 140,
      render: (type: ETaskType) => <TaskTypeTag type={type} />,
    },
    {
      title: t('common.file'),
      dataIndex: 'params',
      ellipsis: true,
      render: (params: any) => {
        if (params?.localPaths) return params.localPaths.join(', ');
        if (params?.keys) return params.keys.join(', ');
        if (params?.files) return params.files.join(', ');
        if (params?.localPath) return params.localPath;
        if (params?.key) return params.key;
        if (params?.oldKey) return `${params.oldKey} → ${params.newKey}`;
        if (params?.sourceKey && params?.targetKey) return `${params.sourceKey} → ${params.targetKey}`;
        return '-';
      },
    },
    {
      title: t('common.size'),
      dataIndex: 'size',
      width: 100,
      render: (size: number) => calculateSize(size),
    },
    {
      title: t('tasks.progress'),
      dataIndex: 'progress',
      width: 180,
      render: (progress: number, record: any) => {
        if (record.status === ETaskStatus.PENDING) {
          return <span style={{ color: 'var(--text-tertiary)' }}>{t('tasks.waiting')}</span>;
        }
        if (record.status === ETaskStatus.FAILED || record.status === ETaskStatus.CANCELED) {
          return (
            <Tooltip title={record.errorMessage} placement="topLeft">
              <span style={{ color: 'var(--error-color)', cursor: 'help' }}>
                {record.errorMessage || t('tasks.failed')}
              </span>
            </Tooltip>
          );
        }
        return <Progress percent={progress} size="small" />;
      },
    },
    {
      title: t('tasks.speed'),
      dataIndex: 'speed',
      width: 100,
      render: (speed: number, record: any) => {
        if (record.status === ETaskStatus.RUNNING) {
          return `${calculateSize(speed)}/s`;
        }
        return '-';
      },
    },
    {
      title: t('tasks.status'),
      dataIndex: 'status',
      width: 100,
      render: (status: ETaskStatus) => {
        const statusConfig: Record<ETaskStatus, { color: string; text: string }> = {
          [ETaskStatus.RUNNING]: { color: 'processing', text: t('tasks.running') },
          [ETaskStatus.PAUSED]: { color: 'warning', text: t('tasks.paused') },
          [ETaskStatus.PENDING]: { color: 'default', text: t('tasks.pending') },
          [ETaskStatus.FAILED]: { color: 'error', text: t('tasks.failed') },
          [ETaskStatus.CANCELED]: { color: 'error', text: t('tasks.canceled') },
          [ETaskStatus.COMPLETED]: { color: 'success', text: t('tasks.completed') },
        };
        const config = statusConfig[status];
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: t('common.actions'),
      dataIndex: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size={4}>
          {record.status === ETaskStatus.RUNNING && (
            <Button
              type="text"
              size="small"
              icon={<PauseOutlined />}
              onClick={() => handlePause(record.taskId)}
              title={t('common.pause')}
            />
          )}
          {(record.status === ETaskStatus.PAUSED || record.status === ETaskStatus.PENDING) && (
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleResume(record.taskId)}
              title={t('common.resume')}
            />
          )}
          {(record.status === ETaskStatus.FAILED || record.status === ETaskStatus.CANCELED) && (
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => handleResume(record.taskId)}
              title={t('tasks.retry')}
            />
          )}
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.taskId)}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="task-table">
      <div className="task-table-header">
        <Space size={16}>
          {runningCount > 0 && <Badge status="processing" text={`${t('tasks.running')}: ${runningCount}`} />}
          {failedCount > 0 && (
            <>
              <Badge status="error" text={`${t('tasks.failed')}: ${failedCount}`} />
              <Button type="primary" size="small" icon={<ReloadOutlined />} onClick={handleRetryAll}>
                {t('tasks.retryAll')}
              </Button>
            </>
          )}
        </Space>
      </div>
      <Table
        rowKey="taskId"
        columns={columns}
        dataSource={tasks}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        size="small"
        scroll={{ y: 'calc(100vh - 260px)' }}
      />
    </div>
  );
};

export default RunningTaskTable;
