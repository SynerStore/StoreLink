import { Button, Space, Table, Tag } from 'antd';
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';

const FailedTaskTable = () => {
  const { t } = useTranslation();
  const { tasks, handleResume, handleDelete } = useTasks([ETaskStatus.FAILED, ETaskStatus.CANCELED], []);

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
      render: (msg: string) => <span style={{ color: 'red' }}>{msg || '-'}</span>,
    },
    {
      title: t('tasks.status'),
      dataIndex: 'status',
      render: (status: ETaskStatus) => {
        const key =
          status === ETaskStatus.CANCELED
            ? 'canceled'
            : status === ETaskStatus.FAILED
              ? 'failed'
              : status === ETaskStatus.PENDING
                ? 'pending'
                : status === ETaskStatus.RUNNING
                  ? 'running'
                  : status === ETaskStatus.PAUSED
                    ? 'paused'
                    : 'completed';
        return <Tag color="red">{t(`tasks.${key}`)}</Tag>;
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
      {/* <div className="task-table-options">
        <Space>
        </Space>
        <InputSearch size="small" allowClear placeholder={t('common.search')} style={{ width: 280 }} />
      </div> */}
      <Table columns={columns} dataSource={tasks} rowKey="taskId" pagination={false} />
    </div>
  );
};

export default FailedTaskTable;
