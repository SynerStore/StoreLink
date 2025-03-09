import { useLayoutEffect, useState } from 'react';
import { Table, Space, Button } from 'antd';
import dayjs from 'dayjs';

import { EWindowSize, OssStorageClassMap, EOssStorageClass } from '@/types';
import FileIcon from '@/renderer/components/FileIcon';
import FileRenameWrap from '@/renderer/components/FileRenameWrap';
import FileDeteleWrap from '@/renderer/components/FileDeteleWrap';
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
  onDownload: (data: any) => Promise<void>;
  onDelete: (data: any) => Promise<void>;
  onRename: (data: any, newName: string) => Promise<void>;
};

const TableContent = (props: TableContentProps) => {
  const [tableScrollHight, seTableScrollHight] = useState(EWindowSize.height - 196 - 55);
  const { data, onPrefixChange, onFileView, onDownload, loading, onRename, onDelete } = props;

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
      title: '存储类型',
      dataIndex: 'storageClass',
      key: 'storageClass',
      render: (val: undefined | EOssStorageClass) => {
        return val ? OssStorageClassMap[val] : '--';
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
      // width: 180,
      render: (_val: string, record: any) => {
        return (
          <Space>
            <Button color="default" variant="text" size="small">
              详情
            </Button>
            <Button color="default" variant="text" size="small" onClick={() => onDownload(record)}>
              下载
            </Button>
            <FileRenameWrap name={record.name} onRename={(newName: string) => onRename(record, newName)}>
              <Button color="default" variant="text" size="small">
                重命名
              </Button>
            </FileRenameWrap>
            <FileDeteleWrap fileInfo={record} onDelete={onDelete}>
              <Button color="danger" variant="text" size="small">
                删除
              </Button>
            </FileDeteleWrap>
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
