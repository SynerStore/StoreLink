import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import hotkeys from 'hotkeys-js';
import { useLoading, useFileTransfer } from '@/renderer/hooks';
import { PathHistory, storeRequest } from '@/renderer/utils';
import { TStoreObject } from '@/types';

interface UseStoreViewerProps {
  connectionId: string;
  bucketName?: string;
  initialPath?: string;
  customListParams?: (prefix: string) => any;
  onPathChange?: (path: string) => string;
  refreshTick?: number;
}

export const useStoreViewer = (props: UseStoreViewerProps) => {
  const {
    connectionId,
    bucketName,
    initialPath = '',
    customListParams,
    onPathChange,
    refreshTick
  } = props;

  const { t } = useTranslation();
  const { loading, setLoading } = useLoading(false);

  // Refs to hold latest function callbacks to avoid dependency cycles
  const customListParamsRef = useRef(customListParams);
  customListParamsRef.current = customListParams;

  const onPathChangeRef = useRef(onPathChange);
  onPathChangeRef.current = onPathChange;

  // State
  const [dataList, setDataList] = useState<TStoreObject[]>([]);
  const [curPrefix, setCurPrefix] = useState<string>(initialPath);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [pathHistory, setPathHistory] = useState<PathHistory | null>(null);

  // File Transfer Logic
  const fileTransfer = useFileTransfer(connectionId);

  // Initialize PathHistory
  useEffect(() => {
    setPathHistory(new PathHistory({ path: initialPath }));
  }, []); // Only run once on mount

  // Data Loading
  const handleGetObjects = useCallback(async () => {
    if (!connectionId) return;

    setLoading(true);
    try {
      const defaultParams = {
        bucketName,
        prefix: curPrefix,
      };

      const params = customListParamsRef.current ? customListParamsRef.current(curPrefix) : defaultParams;

      const res = await storeRequest({
        method: 'list',
        id: connectionId,
        params,
      });
      console.log('List response:', res);

      if (res?.success) {
        // 兼容不同接口返回 (S3返回对象包含objects, Local直接返回数组)
        const list = Array.isArray(res.data) ? res.data : (res.data.objects || []);
        setDataList(list);
        setSelectedKeys([]);
      }
    } catch (error) {
      console.error('Failed to load objects:', error);
    } finally {
      setLoading(false);
    }
  }, [connectionId, curPrefix, bucketName, setLoading]);

  // Load data when prefix or refreshTick changes
  useEffect(() => {
    handleGetObjects();
  }, [handleGetObjects, refreshTick]);

  // Navigation Handlers
  const handlePathBack = useCallback(() => {
    const prefix = pathHistory?.back();
    if (prefix !== undefined) setCurPrefix(prefix);
  }, [pathHistory]);

  const handlePathForward = useCallback(() => {
    const prefix = pathHistory?.forward();
    if (prefix !== undefined) setCurPrefix(prefix);
  }, [pathHistory]);

  const handlePrefixChange = useCallback((value: string) => {
    const processedPath = onPathChangeRef.current ? onPathChangeRef.current(value) : value;
    const prefix = pathHistory?.go(processedPath);
    if (prefix !== undefined) setCurPrefix(prefix);
  }, [pathHistory]);

  const handleSelectionChange = useCallback((keys: React.Key[]) => {
    setSelectedKeys(keys);
  }, []);

  const handleSelectAll = useCallback(() => {
    const allKeys = dataList
      .map(item => item.key)
      .filter((key): key is string => key !== undefined && key !== null);
    setSelectedKeys(allKeys);
  }, [dataList]);

  // Hotkeys
  useEffect(() => {
    const handleKeyParams = (_event: KeyboardEvent, handler: any) => {
      switch (handler.key) {
        case 'ctrl+a':
        case 'command+a':
          handleSelectAll();
          return false; // Prevent default
        case 'backspace':
          if (selectedKeys.length === 0) {
             handlePathBack();
          }
          return false;
      }
    };

    hotkeys('ctrl+a,command+a,backspace', { scope: 'files' }, handleKeyParams);
    hotkeys.setScope('files');

    return () => {
      hotkeys.unbind('ctrl+a,command+a,backspace', 'files', handleKeyParams);
      hotkeys.deleteScope('files');
    };
  }, [handleSelectAll, handlePathBack, selectedKeys.length]);

  const canBack = useMemo(() => pathHistory?.canBack(), [pathHistory, curPrefix]);
  const canForward = useMemo(() => pathHistory?.canForward(), [pathHistory, curPrefix]);

  return {
    loading,
    dataList,
    curPrefix,
    setCurPrefix,
    selectedKeys,
    setSelectedKeys,
    handleSelectionChange,
    handleSelectAll,
    pathHistory,
    canBack,
    canForward,
    handlePathBack,
    handlePathForward,
    handlePrefixChange,
    handleGetObjects,
    ...fileTransfer,
  };
};
