import { Fragment, useMemo } from 'react';
import { Button, Space, Input, Dropdown, Radio } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  DownOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import TableContent from './TableContent';
import CardContent from './CardContent';
import { FileDropWrap, ViewInput, FolderCreateWrap, ButtonGroup, StoreViewerWrap, FileTransferModal } from '@/renderer/components';
import { events, openViewer } from '@/renderer/utils';
import { createTask } from '@/renderer/utils/task';
import { ETaskType } from '@/types';
import { useStoreViewer } from '@/renderer/hooks';
import { useTabsStore, Tab, ETabDisplay, useConfigStore } from '@/renderer/store';

const RadioGroup = Radio.Group;

export type SftpViewerProps = {
  connectionId: string;
  tabData: Tab;
  connection: any;
};
const SftpViewer = (props: SftpViewerProps) => {
  const { connectionId, connection, tabData } = props;
  const { updateTab } = useTabsStore();
  const { connections, initializeData } = useConfigStore();
  const { t } = useTranslation();

  const {
    loading,
    dataList,
    curPrefix,
    selectedKeys,
    setSelectedKeys,
    handleSelectionChange,
    canBack,
    canForward,
    handlePathBack,
    handlePathForward,
    handlePrefixChange,
    handleGetObjects,
    transferModalVisible,
    transferMode,
    transferFiles,
    openTransferModal,
    closeTransferModal,
    handleTransfer,
  } = useStoreViewer({
    connectionId,
    initialPath: '',
    customListParams: (prefix) => ({ prefix }),
    refreshTick: tabData?.refreshTick,
  });

  const display = useMemo(() => {
    return tabData?.display || ETabDisplay.LIST;
  }, [tabData?.display]);

  const handleFileView = (data: any) => {
    console.log('查看文件：', data.name);
    openViewer(connectionId, data);
  };

  const connectionItem = useMemo(() => connections.find((c: any) => c.id === connectionId), [connections, connectionId]);

  const handleToggleCollected = async () => {
    await events.updateConnectionCollected({ id: connectionId, isCollected: !connectionItem?.isCollected });
    await initializeData();
  };

  const handleDownload = async (record: any) => {
    const localPath = await events.getSingleDirPath({});
    if (localPath) {
      createTask(ETaskType.DOWNLOAD, connectionId, 'get', { key: record.key, localPath: localPath }, record.size);
    }
  };

  // 上传文件
  const handleUpload = async () => {
    // 选择文件夹
    const localPaths = await events.getMultDirAndFilePath({});
    if (localPaths && localPaths.length) {
      handlePut(localPaths);
    }
  };

  const handlePut = async (paths: string[]) => {
    return createTask(ETaskType.UPLOAD, connectionId, 'put', {
      prefix: curPrefix,
      localPaths: paths,
    });
  };
  const handlePutFolder = async (folderName: string) => {
    createTask(ETaskType.CREATE_DIR, connectionId, 'putFolder', {
      prefix: curPrefix,
      localPath: folderName,
    });
  };

  const handleDelete = async (record: any) => {
    createTask(
      ETaskType.DELETE,
      connectionId,
      'delete',
      {
        file: record.key,
        isDirectory: record.isDirectory,
      },
      record.size,
    );
  };

  const handleRename = async (record: any, newName: string) => {
    createTask(ETaskType.RENAME, connectionId, 'rename', { oldName: record.key, newName: newName });
  };

  const handleDisplayChange = (e: any) => {
    updateTab({ ...tabData, display: e.target.value });
  };

  const handleMoveTo = async (record: any) => {
    openTransferModal([record], 'move');
  };

  const handleCopyTo = async (record: any) => {
    openTransferModal([record], 'copy');
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    const files = dataList.filter((item: any) => selectedKeys.includes(item.key));
    if (files.length === 0) return;

    if (key === 'copy') {
      openTransferModal(files, 'copy');
    } else if (key === 'move') {
      openTransferModal(files, 'move');
    } else if (key === 'remove') {
      // 批量删除
      files.forEach((file) => handleDelete(file));
    }
  };

  const menuItems = [
    { key: 'copy', label: t('contextMenu.copyTo') },
    { key: 'move', label: t('contextMenu.moveTo') },
    { key: 'remove', label: t('contextMenu.delete') },
  ];

  return (
    <StoreViewerWrap
      onContentClick={() => setSelectedKeys([])}
      headerViewPath={
        <>
          <ButtonGroup>
            <Button disabled={!canBack} icon={<LeftOutlined />} onClick={handlePathBack} />
            <Button disabled={!canForward} icon={<RightOutlined />} onClick={handlePathForward} />
          </ButtonGroup>
          <ViewInput
            prefix={connection.config.root}
            addAfter={
              <span onClick={handleToggleCollected}>
                {connectionItem?.isCollected ? (
                  <StarFilled style={{ fontSize: 'large', color: 'var(--primary-color)' }} />
                ) : (
                  <StarOutlined style={{ fontSize: 'large' }} />
                )}
              </span>
            }
            value={curPrefix}
            onChange={handlePrefixChange}
            style={{ width: '100%' }}
          />
        </>
      }
      headerViewActions={
        <Fragment>
          <Space size={4}>
            <Button type="primary" onClick={handleUpload}>
              {t('common.upload')}
            </Button>
            <FolderCreateWrap onCreateFolder={handlePutFolder}>
              <Button>{t('storeViewer.createFolder')}</Button>
            </FolderCreateWrap>
            <Button>{t('common.download')}</Button>
            <Dropdown trigger={['click']} menu={{ items: menuItems, onClick: handleMenuClick }}>
              <Button>
                {t('common.more')} <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
          <Space size={4}>
            <Input.Search style={{ width: '240px' }} placeholder={t('common.search')} />
            <Button onClick={handleGetObjects}> {t('common.refresh')} </Button>
            <RadioGroup value={display} onChange={handleDisplayChange} buttonStyle="solid">
              <Radio.Button value="list" style={{ fontSize: 'medium' }}>
                <UnorderedListOutlined />
              </Radio.Button>
              <Radio.Button value="card" style={{ fontSize: 'medium' }}>
                <AppstoreOutlined />
              </Radio.Button>
            </RadioGroup>
          </Space>
        </Fragment>
      }
      content={
        <FileDropWrap onDrop={handlePut}>
          {display === ETabDisplay.LIST ? (
            <TableContent
              connectionId={connectionId}
              loading={loading}
              data={dataList}
              onPrefixChange={handlePrefixChange}
              onFileView={handleFileView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onRename={handleRename}
              onSelectionChange={handleSelectionChange}
              selectedKeys={selectedKeys}
              onMoveTo={handleMoveTo}
              onCopyTo={handleCopyTo}
            />
          ) : null}
          {display === ETabDisplay.CARD ? (
            <CardContent
              connectionId={connectionId}
              loading={loading}
              data={dataList}
              onPrefixChange={handlePrefixChange}
              onFileView={handleFileView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onRename={handleRename}
              onSelectionChange={handleSelectionChange}
              selectedKeys={selectedKeys}
              onMoveTo={handleMoveTo}
              onCopyTo={handleCopyTo}
            />
          ) : null}
        </FileDropWrap>
      }
      footer={
        <span>
          {t('storeViewer.footer.selectedCount', { count: selectedKeys.length })},
          {t('storeViewer.footer.loadedCount', { count: dataList.length })}{' '}
        </span>
      }
      extra={
        <FileTransferModal
          visible={transferModalVisible}
          mode={transferMode}
          files={transferFiles}
          sourceConnectionId={connectionId}
          onCancel={closeTransferModal}
          onOk={handleTransfer}
        />
      }
    />
  );
};

export default SftpViewer;
