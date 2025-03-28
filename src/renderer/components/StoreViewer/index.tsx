import { useMemo } from 'react';
import S3Viewer from './S3Viewer';
import LocalViewer from './LocalViewer';

import { useConfigStore } from '@/renderer/store';
const StoreViewer = (props: any) => {
  const { data } = props;
  const connections = useConfigStore((state: any) => state.connections);

  const connection = useMemo(() => {
    return connections.find((item: any) => item.id === data.connectionId);
  }, [data.connectionId]);

  if (connection.type === 's3') return <S3Viewer key={data.id} bucketName={data.name} connectionId={data.connectionId} />;
  if (connection.type === 'local') return <LocalViewer key={data.id} data={connection} connectionId={data.connectionId} />;
};

export default StoreViewer;
