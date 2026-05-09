import { Fragment, useLayoutEffect, useState, useMemo, useCallback } from 'react';
import { FileTable } from '@/renderer/components';
import dayjs from 'dayjs';

import { EWindowSize, TStoreObject } from '@/types';
import { FileIcon, FileContextMenu } from '@/renderer/components';
import { calculateSize } from '@/renderer/utils';
import { useTranslation } from 'react-i18next';
import { useColumnWidths } from '@/renderer/hooks';
import styles from './index.module.css';

export type TableContentProps = {
  connectionId: string;
  data: TStoreObject[];
  loading: boolean;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDelete: (data: any) => Promise<void>;
  onDownload: (data: any) => Promise<void>;
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
    onDownload,
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

  // 列宽调整
  const { columnWidths, handleColumnResize } = useColumnWidths({ viewerType: 'sftp' });

  const handleFileClick = (record: TStoreObject) => {
    if (record.isDirectory) {
      onPrefixChange(record.key as string);
    } else {
      onFileView(record);
    }
  };

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
            onRename={onRename}
            onDelete={onDelete}
            onDownload={onDownload}
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
      title: t('common.modified'),
      dataIndex: 'lastModified',
      key: 'lastModified',
      width: columnWidths.lastModified || 200,
      render: (val: string) => {
        return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--';
      },
    },
  ], [t, connectionId, onRename, onDelete, onDownload, onMoveTo, onCopyTo, columnWidths]);

  const handleColumnResizeCallback = useCallback((key: string, width: number) => {
    handleColumnResize(key, width);
  }, [handleColumnResize]);

  const handleSelectChange = (selectedRowKeys: React.Key[], selectedRows: TStoreObject[]) => {
    onSelectionChange?.(selectedRowKeys);
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  };

  useLayoutEffect(() => {
     seTableScrollHight(document.body.clientHeight - 238);
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
        resizable
        onColumnResize={handleColumnResizeCallback}
      />
    </div>
  );
};

export default TableContent;
