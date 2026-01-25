import { Fragment, useLayoutEffect, useState } from 'react';
import dayjs from 'dayjs';

import { EWindowSize, TStoreObject } from '@/types';
import { FileIcon, FileContextMenu, FileTable } from '@/renderer/components';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';

export type TableContentProps = {
  connectionId: string;
  data: TStoreObject[];
  loading: boolean;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDelete: (data: any) => Promise<void>;
  onRename: (data: any, newName: string) => Promise<void>;
  onSelectionChange?: (selectedKeys: React.Key[]) => void;
  selectedKeys?: React.Key[];
  onMoveTo?: (data: any) => Promise<void>;
  onCopyTo?: (data: any) => Promise<void>;
};

const TableContent = (props: TableContentProps) => {
  const [tableScrollHight, seTableScrollHight] = useState(EWindowSize.height - 196 - 55);
  const {
    data,
    connectionId,
    onPrefixChange,
    onFileView,
    loading,
    onRename,
    onDelete,
    onSelectionChange,
    selectedKeys,
    onMoveTo,
    onCopyTo,
  } = props;
  const { t } = useTranslation();

  const handleFileClick = (record: TStoreObject) => {
    if (record.isDirectory) {
      onPrefixChange(record.key as string);
    } else {
      onFileView(record);
    }
  };

  const handleRowDragStart = (e: React.DragEvent<HTMLElement>, selectedRows: TStoreObject[]) => {
    const dragData = selectedRows.map((row) => ({
      connectionId,
      ...row,
    }));
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const columns = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: TStoreObject) => {
        return (
          <FileContextMenu
            data={record}
            onDetail={(data: any) => {}}
            onRename={onRename}
            onDelete={onDelete}
            onMoveTo={onMoveTo}
            onCopyTo={onCopyTo}
          >
            <div className={styles['file-item']}>
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
      title: t('common.modified'),
      dataIndex: 'lastModified',
      key: 'lastModified',
      width: 200,
      render: (val: string) => {
        return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--';
      },
    },
  ];

  const handleSelectChange = (selectedRowKeys: React.Key[], selectedRows: TStoreObject[]) => {
    onSelectionChange?.(selectedRowKeys);
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  };

  useLayoutEffect(() => {
    seTableScrollHight(document.body.clientHeight - 235);
  }, []);

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
        onRowDoubleClick={handleFileClick}
        onRowDragStart={handleRowDragStart}
      />
    </div>
  );
};

export default TableContent;
