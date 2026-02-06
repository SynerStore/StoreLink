import { useState } from 'react';
import { storeRequest } from '@/renderer/utils';
import { TStoreObject } from '@/types';

export const useFileTransfer = (connectionId: string) => {
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferMode, setTransferMode] = useState<'move' | 'copy'>('copy');
  const [transferFiles, setTransferFiles] = useState<TStoreObject[]>([]);

  const openTransferModal = (files: TStoreObject[], mode: 'move' | 'copy') => {
    setTransferFiles(files);
    setTransferMode(mode);
    setTransferModalVisible(true);
  };

  const closeTransferModal = () => {
    setTransferModalVisible(false);
    setTransferFiles([]);
  };

  const handleTransfer = async (targetConnectionId: string, targetPath: string) => {
    const isMove = transferMode === 'move';
    const sourceConnectionId = connectionId;
    const files = transferFiles.map((f) => f.key);

    await storeRequest({
      method: 'transfer',
      id: connectionId,
      params: {
        sourceConnectionId,
        targetConnectionId,
        files,
        targetPath,
        isMove,
      },
    });

    closeTransferModal();
  };

  return {
    transferModalVisible,
    transferMode,
    transferFiles,
    openTransferModal,
    closeTransferModal,
    handleTransfer,
  };
};
