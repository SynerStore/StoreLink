import { useLayoutEffect, useState } from 'react';
import { Table, Space, Button } from '@arco-design/web-react';
import dayjs from 'dayjs';

import { EWindowSize, EOssStorageClass, TS3Object } from '@/types';
import FileIcon from '@/renderer/components/FileIcon';
import FileRenameWrap from '@/renderer/components/FileRenameWrap';
import FileDeteleWrap from '@/renderer/components/FileDeteleWrap';
import { calculateSize } from '@/renderer/utils';
import './index.css';

export type TableContentProps = {
  data: TS3Object[];
  loading: boolean;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDelete: (data: any) => Promise<void>;
  onRename: (data: any, newName: string) => Promise<void>;
};

const TableContent = (props: TableContentProps) => {
  const [tableScrollHight, seTableScrollHight] = useState(EWindowSize.height - 196 - 55);
  const { data, onPrefixChange, onFileView, loading, onRename, onDelete } = props;

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: TS3Object) => {
        if (record.isDirectory) {
          return (
            <div draggable="true" className="file-item" onClick={() => onPrefixChange(record.key as string)}>
              <FileIcon type="folder" /> <span>{text}</span>
            </div>
          );
        } else {
          return (
            <div draggable="true" className="file-item" onClick={() => onFileView(record)}>
              <FileIcon mime={record.mime as string} /> <span>{text}</span>
            </div>
          );
        }
      },
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (val: number) => {
        return val ? calculateSize(val) : '--';
      },
    },
    {
      title: '修改时间',
      dataIndex: 'lastModified',
      key: 'lastModified',
      width: 200,
      render: (val: string) => {
        return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--';
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 350,
      render: (_val: string, record: TS3Object) => {
        return (
          <Space>
            <Button color="default" size="small">
              详情
            </Button>

            <FileRenameWrap name={record.name as string} onRename={(newName: string) => onRename(record, newName)}>
              <Button color="default" size="small">
                重命名
              </Button>
            </FileRenameWrap>
            <FileDeteleWrap fileInfo={record} onDelete={onDelete}>
              <Button color="danger" size="small">
                删除
              </Button>
            </FileDeteleWrap>
          </Space>
        );
      },
    },
  ];

  const handleSelectChange = (selectedRowKeys: React.Key[], selectedRows: TS3Object[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  };

  useLayoutEffect(() => {
    seTableScrollHight(document.body.clientHeight - 235);
  }, []);

  return (
    <div className="table-content">
      <Table
        rowKey={'key'}
        size="small"
        borderCell={false}
        border={false}
        loading={loading}
        rowSelection={{ type: 'checkbox', columnWidth: 40, onChange: handleSelectChange }}
        scroll={{ y: tableScrollHight }}
        data={data}
        pagination={false}
        columns={columns}
      />
    </div>
  );
};

export default TableContent;
