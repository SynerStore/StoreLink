import { Fragment, useEffect, useMemo, useState } from 'react';
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
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

import TableContent from './TableContent';
import CardContent from './CardContent';
import { FileDropWrap, ViewInput, FolderCreateWrap, ButtonGroup, StoreViewerWrap } from '@/renderer/components';
import { PathHistory, storeRequest, events, openViewer } from '@/renderer/utils';
import { createTask } from '@/renderer/utils/task';
import { ETaskType } from '@/types';
import { useLoading } from '@/renderer/hooks';
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
  const { initializeData } = useConfigStore();
  const [dataList, setDataList] = useState([]);
  const { loading, setLoading } = useLoading(false);
  const [curPrefix, setCurPrefix] = useState<string>('');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [pathHistory, setPathHistory] = useState<PathHistory | null>(null);
  const { t } = useTranslation();

  const display = useMemo(() => {
    return tabData?.display || ETabDisplay.LIST;
  }, [tabData?.display]);

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

  const handleGetObjects = debounce(async () => {
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
      setDataList(res.data);
      setSelectedKeys([]);
      console.log(res.data);
    }
  }, 100);

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

  useEffect(() => {
    if (connectionId) {
      handleGetObjects();
    }
  }, [connectionId, curPrefix, tabData?.refreshTick]);

  useEffect(() => {
    const instance = new PathHistory({ path: curPrefix });
    setPathHistory(instance);
  }, []);

  const menuItems = [
    { key: 'copy', label: t('contextMenu.copyTo') },
    { key: 'move', label: t('contextMenu.moveTo') },
    { key: 'remove', label: t('contextMenu.delete') },
  ];

  return (
    <StoreViewerWrap
      headerViewPath={
        <>
          <ButtonGroup>
            <Button disabled={!canBack} icon={<LeftOutlined />} onClick={handlePathBack} />
            <Button disabled={!canForward} icon={<RightOutlined />} onClick={handlePathForward} />
          </ButtonGroup>
          <ViewInput
            prefix={connection.config.root}
            addAfter={
              <span
                onClick={async () => {
                  await events.updateConnectionCollected({ id: connectionId, isCollected: !connection?.isCollected });
                  await initializeData();
                }}
              >
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
            <Dropdown trigger={['click']} menu={{ items: menuItems }}>
              <Button>
                {t('common.more')} <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
          <Space size={4}>
            <Input.Search style={{ width: '240px' }} placeholder={t('common.search')} />
            <Button onClick={handleGetObjects}> {t('common.refresh')} </Button>
            <RadioGroup value={display} onChange={handleDisplayChange}>
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
    />
  );
};

export default SftpViewer;
