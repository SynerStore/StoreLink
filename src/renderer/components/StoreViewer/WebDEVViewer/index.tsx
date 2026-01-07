import { useEffect, useMemo, useState } from 'react';
import { Button, Space, Input, Dropdown, Radio } from 'antd';
import { LeftOutlined, RightOutlined, DownOutlined, UnorderedListOutlined, AppstoreOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { debounce } from 'lodash';

import TableContent from './TableContent';
import CardContent from './CardContent';
import { ViewInput, FileDropWrap, FolderCreateWrap, ButtonGroup } from '@/renderer/components';
import { PathHistory, storeRequest, events, openViewer } from '@/renderer/utils';
import { useLoading } from '@/renderer/hooks';
import { useTabsStore, Tab, ETabDisplay, useConfigStore } from '@/renderer/store';
import './index.css';

const RadioGroup = Radio.Group;

export type WebDevViewerProps = {
  connectionId: string;
  tabData: Tab;
  connection: any;
};
const WebDevViewer = (props: WebDevViewerProps) => {
  const { connectionId, connection, tabData } = props;
  const { updateTab } = useTabsStore();
  const { initializeData } = useConfigStore();
  const [dataList, setDataList] = useState([]);
  const { loading, setLoading } = useLoading(false);
  const [curPrefix, setCurPrefix] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<PathHistory | null>(null);

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
      console.log(res.data);
    }
  }, 100);

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
      storeRequest({
        method: 'get',
        id: connectionId,
        params: {
          prefix: curPrefix,
          key: record.key,
          isDirectory: record.isDirectory,
          localPath: localPath,
        },
      });
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
        isDirectory: record.isDirectory,
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
                  await initializeData();
                }}
              >
                {connection?.isCollected ? (
                  <StarFilled style={{ fontSize: 'large', color: 'rgb(var(--primary-6))' }} />
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
          <Button  type="primary" onClick={handleUpload}>
            上传
          </Button>
          <FolderCreateWrap onCreateFolder={handlePutFolder}>
            <Button >
              新建目录
            </Button>
          </FolderCreateWrap>
          <Button >
            下载
          </Button>
          <Dropdown
            trigger={['click']}
            menu={{ items: menuItems }}
          >
            <Button >
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

export default WebDevViewer;
