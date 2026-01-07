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
import { FolderCreateWrap, ViewInput, FileDropWrap, ButtonGroup } from '@/renderer/components';
import { PathHistory, events, storeRequest, openViewer, createTask } from '@/renderer/utils';
import { useLoading, useUnmount } from '@/renderer/hooks';
import { useTabsStore, Tab, ETabDisplay, useConfigStore } from '@/renderer/store';
import { ETaskType } from '@/types';
import './index.css';

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
  const [pathHistory, setPathHistory] = useState<PathHistory | null>(null);

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
      console.log(res.data);
    }
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

  const menuItems = [
    { key: 'copy', label: '复制到' },
    { key: 'move', label: '移动到' },
    { key: 'remove', label: '删除' },
  ];

  useUnmount(() => {
    storeRequest({
      method: 'destroy',
      id: connectionId,
    });
  });

  return (
    <div className="viewer">
      <div className="viewer-path">
        <ButtonGroup>
          <Button disabled={!canBack} icon={<LeftOutlined style={{ fontSize: 'large' }} />} onClick={handlePathBack} />
          <Button
            disabled={!canForward}
            icon={<RightOutlined style={{ fontSize: 'large' }} />}
            onClick={handlePathForward}
          />
        </ButtonGroup>
        <div className="viewer-path-input">
          <ViewInput
            prefix={bucketName}
            addAfter={
              <span onClick={handleToggleCollected}>
                {isCollected ? (
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
          <Button type="primary" onClick={handleUpload}>
            上传
          </Button>
          <FolderCreateWrap onCreateFolder={handlePutFolder}>
            <Button>新建目录</Button>
          </FolderCreateWrap>
          <Button>下载</Button>
          <Dropdown trigger={['click']} menu={{ items: menuItems }}>
            <Button>
              更多 <DownOutlined style={{ fontSize: 'medium' }} />
            </Button>
          </Dropdown>
        </Space>
        <Space size={4}>
          <Input.Search style={{ width: '240px' }} />
          <Button onClick={handleGetObjects}> 刷新 </Button>
          <RadioGroup value={display} onChange={(e) => handleDisplayChange(e.target.value)}>
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
              onDownload={handleDownload}
              onDelete={handleDelete}
              onRename={handleRename}
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
            />
          ) : null}
        </FileDropWrap>
      </div>
      <div className="viewer-footer">
        <span>已选 0 项，已拉取 {dataList.length} 项 </span>
      </div>
    </div>
  );
};

export default OssViewer;
