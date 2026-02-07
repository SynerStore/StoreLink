import { Button, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';

const FailedTaskTable = () => {
  const { t } = useTranslation();
  const { tasks, handleResume, handleRetryAll, handleDelete, pagination, handleTableChange, loading } = useTasks(
    [ETaskStatus.FAILED, ETaskStatus.CANCELED],
    [],
  );

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
      title: t('tasks.errorMessage'),
      dataIndex: 'errorMessage',
      render: (msg: string) => (
        <Tooltip title={msg} placement="topLeft">
          <span
            style={{
              color: 'red',
              display: 'inline-block',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'help',
            }}
          >
            {msg || '-'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: t('tasks.status'),
      dataIndex: 'status',
      render: (status: ETaskStatus) => {
        return <Tag color="red">{t(`tasks.${status}`)}</Tag>;
      },
    },
    {
      title: t('common.actions'),
      dataIndex: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => handleResume(record.taskId)}>
            {t('tasks.retry')}
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.taskId)}>
            {t('common.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="task-table">
      <div className="task-table-options" style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<ReloadOutlined />} onClick={handleRetryAll} disabled={tasks.length === 0}>
            {t('tasks.retryAll')}
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="taskId"
        size="small"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        loading={loading}
      />
    </div>
  );
};

export default FailedTaskTable;
