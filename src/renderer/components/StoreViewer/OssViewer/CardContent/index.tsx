import { Spin, Empty } from 'antd';
import { useLayoutEffect, useState } from 'react';

import { TStoreObject, EWindowSize } from '@/types';
import { FileCardList } from '@/renderer/components';

export type CardContentProps = {
  connectionId: string;
  data: TStoreObject[];
  loading: boolean;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDownload: (data: any) => Promise<void>;
  onDelete: (data: any) => Promise<void>;
  onRename: (data: any, newName: string) => Promise<void>;
  onMoveTo?: (data: any) => Promise<void>;
  onCopyTo?: (data: any) => Promise<void>;
  onDropMove?: (sourceKeys: React.Key[], targetFolder: TStoreObject) => Promise<void>;
  onSelectionChange?: (selectedKeys: React.Key[]) => void;
  selectedKeys?: React.Key[];
};

const CardContent = (props: CardContentProps) => {
  const [cardHeight, setCardHeight] = useState(EWindowSize.height - 251);
  const {
    data,
    onPrefixChange,
    onFileView,
    onDownload,
    loading,
    onRename,
    onDelete,
    onMoveTo,
    onCopyTo,
    onDropMove,
    connectionId,
    onSelectionChange,
    selectedKeys,
  } = props;

  useLayoutEffect(() => {
    setCardHeight(document.body.clientHeight - 238);
  }, []);

  return (
    <div className="cards-content">
      <Spin spinning={loading} style={{ width: '100%', minHeight: 200, display: 'block' }}>
        {data.length > 0 ? (
          <FileCardList
            connectionId={connectionId}
            data={data}
            onPrefixChange={onPrefixChange}
            onFileView={onFileView}
            onDownload={onDownload}
            onRename={onRename}
            onDelete={onDelete}
            onMoveTo={onMoveTo}
            onCopyTo={onCopyTo}
            onDropMove={onDropMove}
            onSelectionChange={onSelectionChange}
            selectedKeys={selectedKeys}
            minItemWidth={80}
            maxItemWidth={100}
            columnGap={12}
            rowGap={12}
            height={cardHeight}
          />
        ) : (
          <Empty />
        )}
      </Spin>
    </div>
  );
};

export default CardContent;
