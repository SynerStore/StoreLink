import React, { useState } from 'react';
import { Button, Space, Table, Progress, Tag, Tooltip, Badge } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import TaskDetailModal from './components/TaskDetailModal';
import TaskTypeTag from './components/TaskTypeTag';

const TaskLogTable = () => {
  const { t } = useTranslation();
  const { tasks, pagination, handleTableChange, loading } = useTasks(Object.values(ETaskStatus), []);
  const [detailTask, setDetailTask] = useState<any>(null);

  const columns = [
    {
      title: t('common.type'),
      dataIndex: 'type',
      width: 140,
      render: (type: ETaskType) => <TaskTypeTag type={type} />,
      sorter: true,
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
      sorter: true,
    },
    {
      title: t('tasks.detail.createTime'),
      dataIndex: 'createTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
      sorter: true,
      defaultSortOrder: 'descend' as const,
    },
    {
      title: t('tasks.detail.duration'),
      key: 'duration',
      width: 100,
      render: (_: any, record: any) => {
        if (record.startTime && record.endTime) {
          const ms = dayjs(record.endTime).diff(dayjs(record.startTime), 'millisecond');
          if (ms < 1000) return `${ms}ms`;
          const s = (ms / 1000).toFixed(2);
          return `${s}s`;
        }
        if (record.status === ETaskStatus.RUNNING && record.startTime) {
          return '-';
        }
        return '-';
      },
    },
    {
      title: t('tasks.progress'),
      dataIndex: 'progress',
      width: 150,
      render: (progress: number, record: any) => {
        if (record.status === ETaskStatus.RUNNING || record.status === ETaskStatus.PAUSED) {
          return <Progress percent={progress} size="small" />;
        }
        if (record.status === ETaskStatus.COMPLETED) return <Progress percent={100} size="small" />;
        return (
          <Progress
            percent={progress}
            size="small"
            status={record.status === ETaskStatus.FAILED ? 'exception' : 'normal'}
          />
        );
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
      title: t('common.action'),
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size={4}>
          <Tooltip title={t('common.detail')}>
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setDetailTask(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="task-table">
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="taskId"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ y: 'calc(100vh - 240px)' }}
        size="small"
      />
      <TaskDetailModal open={!!detailTask} onCancel={() => setDetailTask(null)} task={detailTask} />
    </div>
  );
};

export default TaskLogTable;
