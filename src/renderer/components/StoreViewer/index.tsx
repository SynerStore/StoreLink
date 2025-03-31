import { useMemo } from 'react';

import S3Viewer from './S3Viewer';
import LocalViewer from './LocalViewer';
import FtpViewer from './FtpViewer';
import OssViewer from './OssViewer';
import { StoreTypes } from '@/types';
import { useConfigStore } from '@/renderer/store';
const StoreViewer = (props: any) => {
  const { data } = props;
  const connections = useConfigStore((state: any) => state.connections);

  const connection = useMemo(() => {
    return connections.find((item: any) => item.id === data.connectionId);
  }, [data.connectionId]);

  switch (connection.type) {
    case StoreTypes.OSS:
      return <OssViewer key={data.id} bucketName={data.name} connectionId={data.connectionId} />;
    case StoreTypes.S3:
      return <S3Viewer key={data.id} bucketName={data.name} connectionId={data.connectionId} />;
    case StoreTypes.LOCAL:
      return <LocalViewer key={data.id} data={connection} connectionId={data.connectionId} />;
    case StoreTypes.FTP:
      return <FtpViewer key={data.id} data={connection} connectionId={data.connectionId} />;
    default:
      return null;
  }
};

export default StoreViewer;
