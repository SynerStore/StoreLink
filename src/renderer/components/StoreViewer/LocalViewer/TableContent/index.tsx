import { Fragment, useLayoutEffect, useState } from 'react';
import { Table } from 'antd';
import dayjs from 'dayjs';

import { EWindowSize, TStoreObject } from '@/types';
import { FileIcon, FileContextMenu } from '@/renderer/components';
import { calculateSize } from '@/renderer/utils';
import './index.css';

export type TableContentProps = {
  connectionId: string;
  data: TStoreObject[];
  loading: boolean;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDelete: (data: any) => Promise<void>;
  onRename: (data: any, newName: string) => Promise<void>;
};

const TableContent = (props: TableContentProps) => {
  const [tableScrollHight, seTableScrollHight] = useState(EWindowSize.height - 196 - 55);
  const { data, connectionId, onPrefixChange, onFileView, loading, onRename, onDelete } = props;

  const handleFileClick = (record: TStoreObject) => {
    if (record.isDirectory) {
      onPrefixChange(record.key as string);
    } else {
      onFileView(record);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: TStoreObject) => {
        const dataInfo = JSON.stringify({
          connectionId: connectionId,
          key: record.key,
        });
        return (
          <FileContextMenu data={record} onDetail={(data: any) => {}} onRename={onRename} onDelete={onDelete}>
            <div
              draggable="true"
              className="file-item"
              data-info={dataInfo}
              onDoubleClick={() => handleFileClick(record)}
            >
              {record.isDirectory ? (
                <Fragment>
                  <FileIcon type="folder" /> <span>{text}</span>
                </Fragment>
              ) : (
                <Fragment>
                  <FileIcon mime={record.mime as string} /> <span>{text}</span>
                </Fragment>
              )}
            </div>
          </FileContextMenu>
        );
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
  ];

  const handleSelectChange = (selectedRowKeys: React.Key[], selectedRows: TStoreObject[]) => {
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
        bordered={false}
        loading={loading}
        rowSelection={{ type: 'checkbox', columnWidth: 40, onChange: handleSelectChange }}
        scroll={{ y: tableScrollHight }}
        dataSource={data}
        pagination={false}
        columns={columns}
      />
    </div>
  );
};

export default TableContent;
