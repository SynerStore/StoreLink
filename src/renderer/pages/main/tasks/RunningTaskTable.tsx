import { Button, Space, Table, Progress, Tag } from 'antd';
import { DeleteOutlined, PauseOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';

import TaskTypeTag from './components/TaskTypeTag';

const RunningTaskTable = () => {
  const { t } = useTranslation();
  const { tasks, handlePause, handleResume, handleDelete, pagination, handleTableChange, loading } = useTasks(
    [ETaskStatus.RUNNING, ETaskStatus.PAUSED, ETaskStatus.PENDING],
    [],
  );

  const columns = [
    {
      title: t('common.type'),
      dataIndex: 'type',
      render: (type: ETaskType) => <TaskTypeTag type={type} />,
    },
    {
      title: t('common.file'),
      dataIndex: 'params',
      render: (params: any) => {
        if (params?.localPaths) return params.localPaths.join(', ');
        if (params?.keys) return params.keys.join(', ');
        if (params?.files) return params.files.join(', ');
        if (params?.localPath) return params.localPath;
        if (params?.key) return params.key;
        if (params?.oldKey) return `${params.oldKey} -> ${params.newKey}`;
        if (params?.sourceKey && params?.targetKey) return `${params.sourceKey} -> ${params.targetKey}`;
        return '-';
      },
    },
    {
      title: t('common.size'),
      dataIndex: 'size',
      render: (size: number) => calculateSize(size),
    },
    {
      title: t('tasks.progress'),
      dataIndex: 'progress',
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: t('tasks.speed'),
      dataIndex: 'speed',
      render: (speed: number) => `${calculateSize(speed)}/s`,
    },
    {
      title: t('tasks.status'),
      dataIndex: 'status',
      render: (status: ETaskStatus) => {
        const color = status === ETaskStatus.RUNNING ? 'blue' : status === ETaskStatus.PAUSED ? 'orange' : 'default';
        return <Tag color={color}>{t(`tasks.${status}`)}</Tag>;
      },
    },
    {
      title: t('common.actions'),
      dataIndex: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === ETaskStatus.RUNNING ? (
            <Button
              type="text"
              size="small"
              icon={<PauseOutlined />}
              onClick={() => handlePause(record.taskId)}
              title={t('common.pause')}
            />
          ) : (
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleResume(record.taskId)}
              title={t('common.resume')}
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
    <Table
      rowKey="taskId"
      columns={columns}
      dataSource={tasks}
      pagination={pagination}
      loading={loading}
      onChange={handleTableChange}
      size="small"
      scroll={{ y: 'calc(100vh - 220px)' }}
    />
  );
};

export default RunningTaskTable;
