import { Button, Space, Table, Tooltip } from 'antd';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';

import TaskTypeTag from './components/TaskTypeTag';

const CompletedTaskTable = () => {
  const { t } = useTranslation();
  const { tasks, handleDelete, pagination, handleTableChange, loading } = useTasks([ETaskStatus.COMPLETED], []);

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
      title: t('tasks.endTime'),
      dataIndex: 'endTime',
      width: 180,
      render: (endTime: string) => (endTime ? new Date(endTime).toLocaleString() : '-'),
    },
    {
      title: t('tasks.duration'),
      dataIndex: 'duration',
      width: 100,
      render: (_: any, record: any) => {
        if (record.startTime && record.endTime) {
          const duration = new Date(record.endTime).getTime() - new Date(record.startTime).getTime();
          const seconds = Math.floor(duration / 1000);
          if (seconds < 60) return `${seconds}s`;
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          return `${minutes}m ${remainingSeconds}s`;
        }
        return '-';
      },
    },
    {
      title: t('common.actions'),
      dataIndex: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size={4}>
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
    </div>
  );
};

export default CompletedTaskTable;
