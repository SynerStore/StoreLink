import { useLayoutEffect, useState } from 'react';
import { Table, Space, Button } from 'antd';
import dayjs from 'dayjs';

import { EWindowSize } from '@/types';
import FileIcon from '@/renderer/components/FileIcon';
import { calculateSize } from '@/renderer/utils';
import './index.css';

export type DataItem = {
  etag: String;
  lastModified: String;
  name: String;
  owner: String;
  restoreInfo: String;
  size: number;
  storageClass: String;
  type: String;
  url: String;
};
export type TableContentProps = {
  data: any[];
  loading: boolean;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDownload: (data: any) => void;
};

const TableContent = (props: TableContentProps) => {
  const [tableScrollHight, seTableScrollHight] = useState(EWindowSize.height - 196 - 55);
  const { data, onPrefixChange, onFileView, onDownload, loading } = props;

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: any) => {
        if (record.isDir) {
          return (
            <div className="file-item" onClick={() => onPrefixChange(record.path)}>
              <FileIcon type="folder" /> <span>{text}</span>
            </div>
          );
        } else {
          return (
            <div className="file-item" onClick={() => onFileView(record)}>
              <FileIcon mime={record.mime} /> <span>{text}</span>
            </div>
          );
        }
      },
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (val: number) => {
        return val ? calculateSize(val) : '--';
      },
    },
    {
      title: '修改时间',
      dataIndex: 'lastModified',
      key: 'lastModified',
      render: (val: string) => {
        return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--';
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_val: string, record: any) => {
        return (
          <Space>
            <Button type="link" size="small" onClick={() => onDownload(record)}>
              下载
            </Button>
          </Space>
        );
      },
    },
  ];

  const handleSelectChange = (selectedRowKeys: React.Key[], selectedRows: DataItem[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  };

  useLayoutEffect(() => {
    seTableScrollHight(document.body.clientHeight - 196 - 55 - 20);
  }, []);

  return (
    <div className="table-content">
      <Table
        rowKey={'name'}
        size="small"
        loading={loading}
        rowSelection={{ type: 'checkbox', columnWidth: 40, onChange: handleSelectChange }}
        virtual={true}
        scroll={{ y: tableScrollHight }}
        dataSource={data}
        pagination={false}
        columns={columns}
      />
    </div>
  );
};

export default TableContent;
