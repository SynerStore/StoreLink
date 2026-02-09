import React, { useState } from 'react';
import { Button, Space, Table, Progress, Tag, Tooltip } from 'antd';
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
  const { tasks, pagination, handleTableChange, loading } = useTasks(
    Object.values(ETaskStatus),
    [],
  );
  const [detailTask, setDetailTask] = useState<any>(null);

  const columns = [
    {
      title: t('common.type'),
      dataIndex: 'type',
      width: 120,
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
        if (params?.oldKey) return `${params.oldKey} -> ${params.newKey}`;
        if (params?.sourceKey && params?.targetKey) return `${params.sourceKey} -> ${params.targetKey}`;
        return '-';
      },
    },
    {
      title: t('common.size'),
      dataIndex: 'size',
      width: 120,
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
      width: 120,
      render: (_: any, record: any) => {
        if (record.startTime && record.endTime) {
          const ms = dayjs(record.endTime).diff(dayjs(record.startTime), 'millisecond');
          if (ms < 1000) return `${ms}ms`;
          const s = (ms / 1000).toFixed(2);
          return `${s}s`;
        }
        if (record.status === ETaskStatus.RUNNING && record.startTime) {
           // Maybe show dynamic duration? Or just "Running"
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
        // Only show progress for transfer types or if running
        if (record.status === ETaskStatus.RUNNING || record.status === ETaskStatus.PAUSED) {
            return <Progress percent={progress} size="small" />;
        }
        if (record.status === ETaskStatus.COMPLETED) return <Progress percent={100} size="small" />;
        return <Progress percent={progress} size="small" status={record.status === ETaskStatus.FAILED ? 'exception' : 'normal'} />;
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
        let color = 'default';
        if (status === ETaskStatus.COMPLETED) color = 'success';
        if (status === ETaskStatus.FAILED) color = 'error';
        if (status === ETaskStatus.RUNNING) color = 'processing';
        if (status === ETaskStatus.PAUSED) color = 'warning';
        return <Tag color={color}>{t(`tasks.${status}`)}</Tag>;
      },
    },
    {
      title: t('common.action'),
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title={t('common.detail')}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setDetailTask(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="taskId"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ y: 'calc(100vh - 240px)' }}
        size="middle"
      />
      <TaskDetailModal
        open={!!detailTask}
        onCancel={() => setDetailTask(null)}
        task={detailTask}
      />
    </>
  );
};

export default TaskLogTable;
