import { Fragment, useLayoutEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { FileTable, FileIcon, FileContextMenu } from '@/renderer/components';
import { EWindowSize, TStoreObject } from '@/types';
import { calculateSize } from '@/renderer/utils';
import { useColumnWidths } from '@/renderer/hooks';

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
  onMoveTo?: (data: any) => Promise<void>;
  onCopyTo?: (data: any) => Promise<void>;
  onDropMove?: (sourceKeys: React.Key[], targetFolder: TStoreObject) => Promise<void>;
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
    onMoveTo,
    onCopyTo,
    onDropMove,
  } = props;
  const { t } = useTranslation();

  // 列宽调整
  const { columnWidths, handleColumnResize } = useColumnWidths({ viewerType: 'cos' });

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
    seTableScrollHight(document.body.clientHeight - 238);
  }, []);

  const columns = useMemo(() => [
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
            onMoveTo={onMoveTo}
            onCopyTo={onCopyTo}
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
      width: columnWidths.size || 120,
      render: (val: number) => {
        return val ? calculateSize(val) : '--';
      },
    },
    {
      title: t('storeViewer.storageClass'),
      dataIndex: 'storageClass',
      key: 'storageClass',
      width: columnWidths.storageClass || 180,
      render: (val: undefined | string) => {
        return val || '--';
      },
    },
    {
      title: t('common.modified'),
      dataIndex: 'lastModified',
      key: 'lastModified',
      width: columnWidths.lastModified || 200,
      render: (val: string) => {
        return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--';
      },
    },
  ], [t, connectionId, onDownload, onRename, onDelete, onFileView, onMoveTo, onCopyTo, columnWidths]);

  const handleColumnResizeCallback = useCallback((key: string, width: number) => {
    handleColumnResize(key, width);
  }, [handleColumnResize]);

  return (
    <div className="table-content">
      <FileTable
        dataSource={data}
        rowKey="key"
        columns={columns}
        loading={loading}
        size="small"
        bordered={false}
        pagination={false}
        rowSelection={{
          type: 'checkbox',
          columnWidth: 40,
          selectedRowKeys: selectedKeys,
          onChange: handleSelectChange,
        }}
        scroll={{ y: tableScrollHight }}
        onDropMove={onDropMove}
        resizable
        onColumnResize={handleColumnResizeCallback}
      />
    </div>
  );
};

export default TableContent;
