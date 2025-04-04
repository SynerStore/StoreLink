import { useMemo, useEffect, useCallback } from 'react';

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
    return connections.find((item: any) => item.id === data.id);
  }, [data.id]);

  // 拖拽事件监听
  const handleDragEventListener = useCallback((e: any) => {
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
      if (e.target?.dataset?.info) {
        e.dataTransfer.setData('application/json', e.target?.dataset?.info);
      }
    }
  }, []);

  useEffect(() => {
    document.body.addEventListener('dragstart', handleDragEventListener);
    return () => {
      document.body.removeEventListener('dragstart', handleDragEventListener);
    };
  });

  switch (connection.type) {
    case StoreTypes.OSS:
      return <OssViewer key={data.id} bucketName={data.name} connectionId={data.id} />;
    case StoreTypes.S3:
      return <S3Viewer key={data.id} bucketName={data.name} connectionId={data.id} />;
    case StoreTypes.LOCAL:
      return <LocalViewer key={data.id} data={connection} connectionId={data.id} />;
    case StoreTypes.FTP:
      return <FtpViewer key={data.id} data={connection} connectionId={data.id} />;
    default:
      return null;
  }
};

export default StoreViewer;
