import { Button, Input, Space, Table, Tag } from '@arco-design/web-react';
import { IconDelete, IconPlayArrow } from '@arco-design/web-react/icon';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';

const InputSearch = Input.Search;

const FailedTaskTable = () => {
  const { tasks, handleResume, handleDelete } = useTasks(
    [ETaskStatus.FAILED, ETaskStatus.CANCELED],
    []
  );

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      render: (type: ETaskType) => type,
    },
    {
      title: '文件',
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
      title: '大小',
      dataIndex: 'size',
      render: (size: number) => calculateSize(size),
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      render: (msg: string) => <span style={{ color: 'red' }}>{msg || '-'}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: ETaskStatus) => <Tag color="red">{status}</Tag>,
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (_: any, record: any) => (
        <Space>
           <Button size="small" type="primary" icon={<IconPlayArrow />} onClick={() => handleResume(record.taskId)}>
              重试
            </Button>
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

export default FailedTaskTable;
