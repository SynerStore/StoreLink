import { Button, Space, Table, Progress, Tag } from 'antd';
import { DeleteOutlined, PauseOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';

const DownloadingTaskTable = () => {
  const { t } = useTranslation();
  const { tasks, handlePause, handleResume, handleDelete, pagination, handleTableChange, loading } = useTasks(
    [ETaskStatus.PENDING, ETaskStatus.RUNNING, ETaskStatus.PAUSED],
    [ETaskType.DOWNLOAD],
  );

  const columns = [
    {
      title: t('common.file'),
      dataIndex: 'params',
      render: (params: any) => params?.key || params?.localPath || '-',
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
            <Button size="small" icon={<PauseOutlined />} onClick={() => handlePause(record.taskId)}>
              {t('tasks.pause')}
            </Button>
          ) : (
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleResume(record.taskId)}
            >
              {t('tasks.resume')}
            </Button>
          )}
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
        <Input.Search size="small" allowClear placeholder={t('common.search')} style={{ width: 280 }} />
      </div> */}
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

export default DownloadingTaskTable;
