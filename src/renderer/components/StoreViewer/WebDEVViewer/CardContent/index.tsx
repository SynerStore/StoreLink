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
};

const CardContent = (props: CardContentProps) => {
  const { data, onPrefixChange, onFileView, onDownload, loading, onRename, onDelete, connectionId } = props;

  return (
    <div className="cards-content">
      <Spin spinning={loading} style={{ width: '100%', minHeight: 200, display: 'block' }}>
        {data.length > 0 ? (
          <FileCardList
            connectionId={connectionId}
            data={data}
            onPrefixChange={onPrefixChange}
            onFileView={onFileView}
            onRename={onRename}
            onDelete={onDelete}
            onDownload={onDownload}
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
