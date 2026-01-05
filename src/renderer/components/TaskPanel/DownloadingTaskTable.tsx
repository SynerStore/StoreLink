import { Button, Input, Space, Table, Progress, Tag } from '@arco-design/web-react';
import { IconDelete, IconPause, IconPlayArrow } from '@arco-design/web-react/icon';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';

const InputSearch = Input.Search;

const DownloadingTaskTable = () => {
  const { tasks, handlePause, handleResume, handleDelete } = useTasks(
    [ETaskStatus.PENDING, ETaskStatus.RUNNING, ETaskStatus.PAUSED],
    [ETaskType.DOWNLOAD]
  );

  const columns = [
    {
      title: '文件',
      dataIndex: 'params',
      render: (params: any) => params?.key || params?.localPath || '-',
    },
    {
      title: '大小',
      dataIndex: 'size',
      render: (size: number) => calculateSize(size),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: '速度',
      dataIndex: 'speed',
      render: (speed: number) => `${calculateSize(speed)}/s`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: ETaskStatus) => {
        const color = status === ETaskStatus.RUNNING ? 'arcoblue' : status === ETaskStatus.PAUSED ? 'orange' : 'gray';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === ETaskStatus.RUNNING ? (
            <Button size="small" type="outline" icon={<IconPause />} onClick={() => handlePause(record.taskId)}>
              暂停
            </Button>
          ) : (
            <Button size="small" type="primary" icon={<IconPlayArrow />} onClick={() => handleResume(record.taskId)}>
              开始
            </Button>
          )}
          <Button size="small" type="outline" status="danger" icon={<IconDelete />} onClick={() => handleDelete(record.taskId)}>
            删除
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
        <InputSearch size="small" allowClear placeholder="搜索" style={{ width: 280 }} />
      </div> */}
      <Table columns={columns} data={tasks} rowKey="taskId" pagination={false} />
    </div>
  );
};

export default DownloadingTaskTable;
