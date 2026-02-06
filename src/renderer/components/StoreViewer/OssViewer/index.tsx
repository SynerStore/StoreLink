import { Fragment, useEffect, useMemo, useState } from 'react';
import hotkeys from 'hotkeys-js';
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

import TableContent from './TableContent';
import CardContent from './CardContent';
import {
  FolderCreateWrap,
  ViewInput,
  FileDropWrap,
  ButtonGroup,
  StoreViewerWrap,
  FileTransferModal,
} from '@/renderer/components';
import { PathHistory, events, storeRequest, openViewer, createTask } from '@/renderer/utils';
import { useLoading, useUnmount } from '@/renderer/hooks';
import { useTabsStore, Tab, ETabDisplay, useConfigStore } from '@/renderer/store';
import { ETaskType, TStoreObject } from '@/types';
import { useTranslation } from 'react-i18next';

const RadioGroup = Radio.Group;

export type OssViewerProps = {
  connectionId: string;
  bucketName: string;
  data: Tab;
};
const OssViewer = (props: OssViewerProps) => {
  const { connectionId, bucketName, data } = props;
  const { updateTab } = useTabsStore();
  const { connections, initializeData } = useConfigStore();
  const [dataList, setDataList] = useState([]);
  const { loading, setLoading } = useLoading(false);
  const [curPrefix, setCurPrefix] = useState<string>('');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [pathHistory, setPathHistory] = useState<PathHistory | null>(null);
  const { t } = useTranslation();

  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferMode, setTransferMode] = useState<'move' | 'copy'>('copy');
  const [transferFiles, setTransferFiles] = useState<TStoreObject[]>([]);

  const display = useMemo(() => {
    return data?.display || ETabDisplay.LIST;
  }, [data?.display]);

  const [canBack, canForward] = useMemo(() => {
    return [pathHistory?.canBack(), pathHistory?.canForward()];
  }, [pathHistory, curPrefix]);

  const handlePathBack = () => {
    const prefix = pathHistory?.back() as string;
    setCurPrefix(prefix);
  };

  const handlePathForward = () => {
    const prefix = pathHistory?.forward() as string;
    setCurPrefix(prefix);
  };

  const handleGetObjects = async () => {
    setLoading(true);
    const res = await storeRequest({
      method: 'list',
      id: connectionId,
      params: {
        prefix: curPrefix,
      },
    });
    setLoading(false);
    if (res.success) {
      setDataList(res.data.objects);
      setSelectedKeys([]);
      console.log(res.data);
    }
  };

  const handleSelectionChange = (keys: React.Key[]) => {
    setSelectedKeys(keys);
  };

  const handlePrefixChange = (value: string) => {
    const prefix = pathHistory?.go(value) as string;
    setCurPrefix(prefix);
  };

  const handleFileView = (data: any) => {
    console.log('查看文件：', data.name);
    openViewer(connectionId, data);
  };
  const connection = useMemo(() => connections.find((c: any) => c.id === connectionId), [connections, connectionId]);
  const isCollected = connection?.isCollected;
  const handleToggleCollected = async () => {
    await events.updateConnectionCollected({ id: connectionId, isCollected: !isCollected });
    await initializeData();
  };

  const handleDownload = async (record: any) => {
    const localPath = await events.getSingleDirPath({});
    if (localPath) {
      createTask(
        ETaskType.DOWNLOAD,
        connectionId,
        'get',
        { prefix: curPrefix, key: record.key, localPath: localPath },
        record.size,
      );
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
        key: record.key,
      },
      record.size,
    );
  };

  const handleRename = async (record: any, newName: string) => {
    createTask(ETaskType.RENAME, connectionId, 'rename', {
      prefix: curPrefix,
      oldKey: record.key,
      newKey: newName,
    });
  };

  const handleMoveTo = async (record: any) => {
    setTransferFiles([record]);
    setTransferMode('move');
    setTransferModalVisible(true);
  };

  const handleCopyTo = async (record: any) => {
    setTransferFiles([record]);
    setTransferMode('copy');
    setTransferModalVisible(true);
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

    setTransferModalVisible(false);
  };

  const handleDropMove = async (sourceKeys: React.Key[], targetFolder: TStoreObject) => {
    const sourceConnectionId = connectionId;
    const targetConnectionId = connectionId;
    const targetPath = targetFolder.key as string;

    await storeRequest({
      method: 'transfer',
      id: connectionId,
      params: {
        sourceConnectionId,
        targetConnectionId,
        files: sourceKeys,
        targetPath,
        isMove: true,
      },
    });

    // Refresh the list after move
    handleGetObjects();
  };

  const handleDisplayChange = (value: ETabDisplay) => {
    updateTab({ ...data, display: value });
  };

  useEffect(() => {
    if (connectionId) {
      handleGetObjects();
    }
  }, [connectionId, curPrefix, data?.refreshTick]);

  useEffect(() => {
    const instance = new PathHistory({ path: curPrefix });
    setPathHistory(instance);
  }, []);

  useEffect(() => {
    // Cmd + A / Ctrl + A Select All
    hotkeys('command+a,ctrl+a', (e: KeyboardEvent) => {
      e.preventDefault();
      setSelectedKeys(dataList.map((item: any) => item.key));
    });

    return () => {
      hotkeys.unbind('command+a,ctrl+a');
    };
  }, [dataList]);

  const menuItems = [
    { key: 'copy', label: t('contextMenu.copyTo') },
    { key: 'move', label: t('contextMenu.moveTo') },
    { key: 'remove', label: t('contextMenu.delete') },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    const files = dataList.filter((item: any) => selectedKeys.includes(item.key));
    if (files.length === 0) return;

    if (key === 'copy') {
      setTransferFiles(files);
      setTransferMode('copy');
      setTransferModalVisible(true);
    } else if (key === 'move') {
      setTransferFiles(files);
      setTransferMode('move');
      setTransferModalVisible(true);
    } else if (key === 'remove') {
      // 批量删除
      files.forEach((file) => handleDelete(file));
    }
  };

  useUnmount(() => {
    storeRequest({
      method: 'destroy',
      id: connectionId,
    });
  });

  return (
    <StoreViewerWrap
      onContentClick={() => setSelectedKeys([])}
      headerViewPath={
        <>
          <ButtonGroup>
            <Button
              disabled={!canBack}
              icon={<LeftOutlined style={{ fontSize: 'large' }} />}
              onClick={handlePathBack}
            />
            <Button
              disabled={!canForward}
              icon={<RightOutlined style={{ fontSize: 'large' }} />}
              onClick={handlePathForward}
            />
          </ButtonGroup>

          <ViewInput
            prefix={bucketName}
            addAfter={
              <span onClick={handleToggleCollected}>
                {connection?.isCollected ? (
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
                {t('common.more')} <DownOutlined style={{ fontSize: 'medium' }} />
              </Button>
            </Dropdown>
          </Space>
          <Space size={4}>
            <Input.Search style={{ width: '240px' }} placeholder={t('common.search')} />
            <Button onClick={handleGetObjects}> {t('common.refresh')} </Button>
            <RadioGroup value={display} onChange={(e) => handleDisplayChange(e.target.value)} buttonStyle="solid">
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
              onMoveTo={handleMoveTo}
              onCopyTo={handleCopyTo}
              onDropMove={handleDropMove}
              onSelectionChange={handleSelectionChange}
              selectedKeys={selectedKeys}
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
              onMoveTo={handleMoveTo}
              onCopyTo={handleCopyTo}
              onDropMove={handleDropMove}
              onSelectionChange={handleSelectionChange}
              selectedKeys={selectedKeys}
            />
          ) : null}
          <FileTransferModal
            visible={transferModalVisible}
            mode={transferMode}
            files={transferFiles}
            sourceConnectionId={connectionId}
            onCancel={() => setTransferModalVisible(false)}
            onOk={handleTransfer}
          />
        </FileDropWrap>
      }
      footer={
        <span>
          {t('storeViewer.footer.selectedCount', { count: selectedKeys.length })},
          {t('storeViewer.footer.loadedCount', { count: dataList.length })}{' '}
        </span>
      }
    />
  );
};

export default OssViewer;
