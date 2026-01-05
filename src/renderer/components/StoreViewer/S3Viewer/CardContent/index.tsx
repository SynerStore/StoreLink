import { Fragment } from 'react';
import { Tooltip, Spin, Empty } from '@arco-design/web-react';
import dayjs from 'dayjs';

import { TStoreObject } from '@/types';
import { FileIcon, FileContextMenu, ResponsiveGrid } from '@/renderer/components';
import { calculateSize } from '@/renderer/utils';
import './index.css';

export type CardContentProps = {
  connectionId: string;
  data: TStoreObject[];
  loading: boolean;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDownload: (data: any) => Promise<void>;
  onDelete: (data: any) => Promise<void>;
  onRename: (data: any, newName: string) => Promise<void>;
};

const CardContent = (props: CardContentProps) => {
  const { data, onPrefixChange, onFileView, onDownload, loading, onRename, onDelete, connectionId } = props;

  const handleFileClick = (record: TStoreObject) => {
    if (record.isDirectory) {
      onPrefixChange(record.key as string);
    } else {
      onFileView(record);
    }
  };

  const handleSelectChange = (selectedRowKeys: React.Key[], selectedRows: TStoreObject[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  };

  return (
    <div className="cards-content">
      <Spin loading={loading} style={{ width: '100%', minHeight: 200, display: 'block' }}>
        {data.length > 0 ? (
          <ResponsiveGrid minItemWidth={80} maxItemWidth={100} columnGap={12} rowGap={12}>
            {data.map((item) => {
              return (
                <FileContextMenu
                  key={item.key}
                  data={item}
                  onDetail={(data: any) => {}}
                  onDownload={onDownload}
                  onRename={onRename}
                  onDelete={onDelete}
                >
                  <Tooltip
                    key={item.key}
                    mini
                    position="bottom"
                    trigger="click"
                    content={
                      <div>
                        <div>名称: {item.name}</div>
                        <div>大小: {calculateSize(item.size as number)}</div>
                        <div>修改时间: {dayjs(item.lastModified).format('YYYY-MM-DD HH:mm:ss')}</div>
                      </div>
                    }
                  >
                    <div
                      draggable="true"
                      className="file-item"
                      data-info={item}
                      onDoubleClick={() => handleFileClick(item)}
                    >
                      {item.isDirectory ? (
                        <Fragment>
                          <FileIcon size="large" type="folder" />
                          <div className="file-name">{item.name}</div>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <FileIcon size="large" mime={item.mime as string} />
                          <div className="file-name">{item.name}</div>
                        </Fragment>
                      )}
                    </div>
                  </Tooltip>
                </FileContextMenu>
              );
            })}
          </ResponsiveGrid>
        ) : (
          <Empty />
        )}
      </Spin>
    </div>
  );
};

export default CardContent;
