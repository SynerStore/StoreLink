import { useEffect, useMemo, useState } from 'react';
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
import { FolderCreateWrap, ViewInput, FileDropWrap, ButtonGroup, FileTransferModal } from '@/renderer/components';
import { PathHistory, storeRequest, openViewer, events } from '@/renderer/utils';
import { useLoading } from '@/renderer/hooks';
import { useTabsStore, Tab, ETabDisplay } from '@/renderer/store';
import { TStoreObject } from '@/types';
import './index.css';

const RadioGroup = Radio.Group;

export type LocalViewerProps = {
  connectionId: string;
  tabData: Tab;
  connection: any;
};
const LocalViewer = (props: LocalViewerProps) => {
  const { connectionId, tabData, connection } = props;
  const { updateTab } = useTabsStore();
  const [dataList, setDataList] = useState([]);
  const { loading, setLoading } = useLoading(false);
  const [curPrefix, setCurPrefix] = useState<string>('');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [pathHistory, setPathHistory] = useState<PathHistory | null>(null);

  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferMode, setTransferMode] = useState<'move' | 'copy'>('copy');
  const [transferFiles, setTransferFiles] = useState<TStoreObject[]>([]);

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
      setDataList(res.data);
      setSelectedKeys([]);
      console.log(res.data);
    }
  };

  const handlePrefixChange = (value: string) => {
    const nextPath = value.replace(connection.config.root, '');
    const prefix = pathHistory?.go(nextPath) as string;
    setCurPrefix(prefix);
  };

  const handleFileView = (data: any) => {
    openViewer(connectionId, data);
  };

  const handlePut = async (paths: string[]) => {
    return storeRequest({
      method: 'put',
      id: connectionId,
      params: {
        prefix: curPrefix,
        localPaths: paths,
      },
    });
  };

  const handlePutFolder = async (folderName: string) => {
    storeRequest({
      method: 'putFolder',
      id: connectionId,
      params: {
        prefix: curPrefix,
        localPath: folderName,
      },
    });
  };

  const handleDelete = async (record: any) => {
    storeRequest({
      method: 'delete',
      id: connectionId,
      params: {
        file: record.key,
      },
    });
  };

  const handleRename = async (record: any, newName: string) => {
    storeRequest({
      method: 'rename',
      id: connectionId,
      params: { oldName: record.key, newName: newName },
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

  const handleSelectionChange = (keys: React.Key[]) => {
    setSelectedKeys(keys);
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
    { key: 'copy', label: '复制到' },
    { key: 'move', label: '移动到' },
    { key: 'remove', label: '删除' },
  ];

  return (
    <div className="viewer">
      <div className="viewer-path">
        <ButtonGroup>
          <Button disabled={!canBack} icon={<LeftOutlined />} onClick={handlePathBack} />
          <Button disabled={!canForward} icon={<RightOutlined />} onClick={handlePathForward} />
        </ButtonGroup>
        <div className="viewer-path-input">
          <ViewInput
            prefix={connection.config.root}
            addAfter={
              <span
                onClick={async () => {
                  await events.updateConnectionCollected({ id: connectionId, isCollected: !connection?.isCollected });
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
        </div>
      </div>
      <div className="viewer-actions">
        <Space size={4}>
          <FolderCreateWrap onCreateFolder={handlePutFolder}>
            <Button>新建目录</Button>
          </FolderCreateWrap>
          <Button>下载</Button>
          <Dropdown trigger={['click']} menu={{ items: menuItems }}>
            <Button>
              更多 <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
        <Space size={4}>
          <Input.Search style={{ width: '240px' }} />
          <Button onClick={handleGetObjects}> 刷新 </Button>
          <RadioGroup value={display} onChange={handleDisplayChange}>
            <Radio.Button value="list" style={{ fontSize: 'medium' }}>
              <UnorderedListOutlined />
            </Radio.Button>
            <Radio.Button value="card" style={{ fontSize: 'medium' }}>
              <AppstoreOutlined />
            </Radio.Button>
          </RadioGroup>
        </Space>
      </div>
      <div className="viewer-content">
        <FileDropWrap onDrop={handlePut}>
          {display === ETabDisplay.LIST ? (
            <TableContent
              connectionId={connectionId}
              loading={loading}
              data={dataList}
              onPrefixChange={handlePrefixChange}
              onFileView={handleFileView}
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
              onDelete={handleDelete}
              onRename={handleRename}
              onSelectionChange={handleSelectionChange}
              selectedKeys={selectedKeys}
              onMoveTo={handleMoveTo}
              onCopyTo={handleCopyTo}
            />
          ) : null}
        </FileDropWrap>
      </div>
      <div className="viewer-footer">
        <span>已选 {selectedKeys.length} 项，已拉取 {dataList.length} 项 </span>
      </div>
      <FileTransferModal
        visible={transferModalVisible}
        mode={transferMode}
        files={transferFiles}
        sourceConnectionId={connectionId}
        onCancel={() => setTransferModalVisible(false)}
        onOk={handleTransfer}
      />
    </div>
  );
};

export default LocalViewer;
