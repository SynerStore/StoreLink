import { Spin, Empty } from 'antd';

import { TStoreObject } from '@/types';
import { FileCardList } from '@/renderer/components';
import './index.css';

export type CardContentProps = {
  connectionId: string;
  data: TStoreObject[];
  loading: boolean;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDownload?: (data: any) => Promise<void>;
  onDelete: (data: any) => Promise<void>;
  onRename: (data: any, newName: string) => Promise<void>;
  onMoveTo?: (data: any) => Promise<void>;
  onCopyTo?: (data: any) => Promise<void>;
  onSelectionChange?: (selectedKeys: React.Key[]) => void;
  selectedKeys?: React.Key[];
};

const CardContent = (props: CardContentProps) => {
  const {
    data,
    onPrefixChange,
    onFileView,
    loading,
    onRename,
    onDelete,
    onDownload,
    onMoveTo,
    onCopyTo,
    onSelectionChange,
    selectedKeys,
  } = props;

  return (
    <div className="cards-content">
      <Spin spinning={loading} style={{ width: '100%', minHeight: 200, display: 'block' }}>
        {data.length > 0 ? (
          <FileCardList
            data={data}
            onPrefixChange={onPrefixChange}
            onFileView={onFileView}
            onRename={onRename}
            onDelete={onDelete}
            onDownload={onDownload}
            onMoveTo={onMoveTo}
            onCopyTo={onCopyTo}
            onSelectionChange={onSelectionChange}
            selectedKeys={selectedKeys}
            minItemWidth={80}
            maxItemWidth={100}
            columnGap={12}
            rowGap={12}
          />
        ) : (
          <Empty />
        )}
      </Spin>
    </div>
  );
};

export default CardContent;
