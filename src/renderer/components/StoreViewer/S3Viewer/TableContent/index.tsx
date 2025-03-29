import { useLayoutEffect, useState } from 'react';
import { Table, Space, Button } from '@arco-design/web-react';
import { IconDownload, IconInfoCircle, IconEdit, IconDelete } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';

import { EWindowSize, OssStorageClassMap, EOssStorageClass, TS3Object } from '@/types';
import FileIcon from '@/renderer/components/FileIcon';
import FileRenameWrap from '@/renderer/components/FileRenameWrap';
import FileDeteleWrap from '@/renderer/components/FileDeteleWrap';
import ContextMenu from '@/renderer/components/ContextMenu';
import { calculateSize } from '@/renderer/utils';
import './index.css';

export type TableContentProps = {
  data: TS3Object[];
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
      render: (text: any, record: TS3Object) => {
        return (
          <ContextMenu
            menu={[
              {
                icon: <IconInfoCircle />,
                text: '详情',
                onClick: () => {},
              },
              {
                icon: <IconDownload />,
                text: '下载',
                onClick: () => onDownload(record),
              },
              {
                render: () => (
                  <FileRenameWrap
                    name={record.name as string}
                    onRename={(newName: string) => onRename(record, newName)}
                  >
                    <Space size={2}>
                      <IconEdit /> 重命名
                    </Space>
                  </FileRenameWrap>
                ),
              },
              {
                render: () => (
                  <FileDeteleWrap fileInfo={record} onDelete={onDelete}>
                    <Space size={2}>
                      <IconDelete /> 删除
                    </Space>
                  </FileDeteleWrap>
                ),
              },
            ]}
          >
            {record.isDirectory ? (
              <div draggable="true" className="file-item" onClick={() => onPrefixChange(record.key as string)}>
                <FileIcon type="folder" /> <span>{text}</span>
              </div>
            ) : (
              <div draggable="true" className="file-item" onClick={() => onFileView(record)}>
                <FileIcon mime={record.mime as string} /> <span>{text}</span>
              </div>
            )}
          </ContextMenu>
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
      title: '存储类型',
      dataIndex: 'storageClass',
      key: 'storageClass',
      width: 180,
      render: (val: undefined | EOssStorageClass) => {
        return val || '--';
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
      with: 200,
      render: (_val: string, record: TS3Object) => {
        return (
          <Space>
            <Button icon={<IconInfoCircle />} type="text" color="default" size="small" />
            <Button
              icon={<IconDownload />}
              type="text"
              color="default"
              size="small"
              onClick={() => onDownload(record)}
            />
            <FileRenameWrap name={record.name as string} onRename={(newName: string) => onRename(record, newName)}>
              <Button icon={<IconEdit />} type="text" color="default" size="small" />
            </FileRenameWrap>
            <FileDeteleWrap fileInfo={record} onDelete={onDelete}>
              <Button icon={<IconDelete />} type="text" status="danger" size="small" />
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
