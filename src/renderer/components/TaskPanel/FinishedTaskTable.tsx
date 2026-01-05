import { Button, Input, Space, Table } from '@arco-design/web-react';
import { IconDelete } from '@arco-design/web-react/icon';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus, ETaskType } from '@/types';
import { calculateSize } from '@/renderer/utils';

const InputSearch = Input.Search;

const FinishedTaskTable = () => {
  const { tasks, handleDelete } = useTasks(
    [ETaskStatus.COMPLETED],
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
      title: '完成时间',
      dataIndex: 'endTime',
      render: (endTime: string) => endTime ? new Date(endTime).toLocaleString() : '-',
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (_: any, record: any) => (
        <Space>
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

export default FinishedTaskTable;
