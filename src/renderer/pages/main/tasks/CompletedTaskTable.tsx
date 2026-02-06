import { Button, Space, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';

const CompletedTaskTable = () => {
  const { t } = useTranslation();
  const { tasks, handleDelete, pagination, handleTableChange, loading } = useTasks([ETaskStatus.COMPLETED], []);

  const columns = [
    {
      title: t('common.type'),
      dataIndex: 'type',
      render: (type: ETaskType) => type,
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
      title: t('tasks.endTime'),
      dataIndex: 'endTime',
      render: (endTime: string) => (endTime ? new Date(endTime).toLocaleString() : '-'),
    },
    {
      title: t('common.actions'),
      dataIndex: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.taskId)}>
            {t('common.delete')}
          </Button>
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

export default CompletedTaskTable;
