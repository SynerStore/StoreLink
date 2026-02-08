import { Empty } from 'antd';
import { useLayoutEffect, useState } from 'react';

import { TStoreObject, EWindowSize } from '@/types';
import { FileCardList } from '@/renderer/components';

export type CardContentProps = {
  connectionId: string;
  data: TStoreObject[];
  loading: boolean;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDownload?: (data: any) => Promise<void>;
  onDelete: (data: any) => Promise<void>;
  onRename: (data: any, newName: string) => Promise<void>;
  onSelectionChange?: (selectedKeys: React.Key[]) => void;
  selectedKeys?: React.Key[];
  onMoveTo?: (data: any) => Promise<void>;
  onCopyTo?: (data: any) => Promise<void>;
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
    connectionId,
    onSelectionChange,
    selectedKeys,
    onMoveTo,
    onCopyTo,
  } = props;

  useLayoutEffect(() => {
    setCardHeight(document.body.clientHeight - 238);
  }, []);

  return (
    <div className="cards-content">
      {data.length > 0 || loading ? (
        <FileCardList
          connectionId={connectionId}
          data={data}
          onPrefixChange={onPrefixChange}
          onFileView={onFileView}
          onRename={onRename}
          onDelete={onDelete}
          onDownload={onDownload}
          onSelectionChange={onSelectionChange}
          selectedKeys={selectedKeys}
          onMoveTo={onMoveTo}
          onCopyTo={onCopyTo}
          minItemWidth={80}
          maxItemWidth={100}
          columnGap={12}
          rowGap={12}
          height={cardHeight}
          loading={loading}
        />
      ) : (
        <Empty />
      )}
    </div>
  );
};

export default CardContent;
