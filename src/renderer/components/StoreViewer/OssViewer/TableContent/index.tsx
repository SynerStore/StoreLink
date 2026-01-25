import { Fragment, useLayoutEffect, useState } from 'react';
import { FileTable } from '@/renderer/components';
import dayjs from 'dayjs';

import { EWindowSize, EOssStorageClass, TStoreObject } from '@/types';
import { FileIcon, FileContextMenu } from '@/renderer/components';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';

export type TableContentProps = {
  connectionId: string;
  data: TStoreObject[];
  loading: boolean;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDownload: (data: any) => Promise<void>;
  onDelete: (data: any) => Promise<void>;
  onRename: (data: any, newName: string) => Promise<void>;
  onSelectionChange?: (selectedKeys: React.Key[]) => void;
  selectedKeys?: React.Key[];
};

const TableContent = (props: TableContentProps) => {
  const [tableScrollHight, seTableScrollHight] = useState(EWindowSize.height - 251);
  const {
    data,
    onPrefixChange,
    onFileView,
    onDownload,
    loading,
    onRename,
    onDelete,
    connectionId,
    onSelectionChange,
    selectedKeys,
  } = props;
  const { t } = useTranslation();

  const handleFileClick = (record: TStoreObject) => {
    if (record.isDirectory) {
      onPrefixChange(record.key as string);
    } else {
      onFileView(record);
    }
  };

  const handleSelectChange = (selectedRowKeys: React.Key[], selectedRows: TStoreObject[]) => {
    onSelectionChange?.(selectedRowKeys);
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  };

  useLayoutEffect(() => {
    seTableScrollHight(document.body.clientHeight - 235);
  }, []);

  const columns = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: TStoreObject) => {
        const dataInfo = JSON.stringify({
          connectionId: connectionId,
          key: record.key,
        });
        return (
          <FileContextMenu
            data={record}
            onDetail={(data: any) => {}}
            onDownload={onDownload}
            onRename={onRename}
            onDelete={onDelete}
            onOpen={onFileView}
          >
            <div
              draggable="true"
              className={styles['file-item']}
              data-info={dataInfo}
              onDoubleClick={() => handleFileClick(record)}
            >
              {record.isDirectory ? (
                <Fragment>
                  <FileIcon type="folder" /> <span className={styles['file-name']}>{text}</span>
                </Fragment>
              ) : (
                <Fragment>
                  <FileIcon mime={record.mime as string} /> <span className={styles['file-name']}>{text}</span>
                </Fragment>
              )}
            </div>
          </FileContextMenu>
        );
      },
    },
    {
      title: t('common.size'),
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (val: number) => {
        return val ? calculateSize(val) : '--';
      },
    },
    {
      title: t('storeViewer.storageClass'),
      dataIndex: 'storageClass',
      key: 'storageClass',
      width: 180,
      render: (val: undefined | EOssStorageClass) => {
        return val || '--';
      },
    },
    {
      title: t('common.modified'),
      dataIndex: 'lastModified',
      key: 'lastModified',
      width: 200,
      render: (val: string) => {
        return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--';
      },
    },
  ];

  return (
    <div className="table-content">
      <FileTable
        rowKey={'key'}
        size="small"
        bordered={false}
        loading={loading}
        rowSelection={{
          type: 'checkbox',
          columnWidth: 40,
          onChange: handleSelectChange,
          selectedRowKeys: selectedKeys,
        }}
        scroll={{ y: tableScrollHight }}
        dataSource={data}
        pagination={false}
        columns={columns}
      />
    </div>
  );
};

export default TableContent;
