import { useEffect, useMemo, useState } from 'react';
import { Button, Space, Input, Dropdown, Menu, Radio } from '@arco-design/web-react';
import { IconLeft, IconRight, IconDown, IconList, IconApps } from '@arco-design/web-react/icon';

import TableContent from './TableContent';
import CardContent from './CardContent';
import FolderCreateWrap from '@/renderer/components/FolderCreateWrap';
import ViewInput from '@/renderer/components/ViewInput';
import FileDropWrap from '@/renderer/components/FileDropWrap';
import { PathHistory, storeRequest } from '@/renderer/utils';
import { useLoading } from '@/renderer/hooks';
import { useTabsStore, Tab, ETabDisplay } from '@/renderer/store';
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
      console.log(res.data);
    }
  };

  const handlePrefixChange = (value: string) => {
    const nextPath = value.replace(connection.config.root, '');
    const prefix = pathHistory?.go(nextPath) as string;
    setCurPrefix(prefix);
  };

  const handleFileView = (data: any) => {
    console.log('查看文件：', connection.name);
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

  const handleDisplayChange = (value: ETabDisplay) => {
    updateTab({ ...tabData, display: value });
  };

  useEffect(() => {
    if (connectionId) {
      handleGetObjects();
    }
  }, [connectionId, curPrefix]);

  useEffect(() => {
    const instance = new PathHistory({ path: curPrefix });
    setPathHistory(instance);
  }, []);

  return (
    <div className="viewer">
      <div className="viewer-path">
        <Space size={2}>
          <Button disabled={!canBack} icon={<IconLeft />} onClick={handlePathBack} />
          <Button disabled={!canForward} icon={<IconRight />} onClick={handlePathForward} />
        </Space>
        <div className="viewer-path-input">
          <ViewInput
            prefix={connection.config.root}
            value={curPrefix}
            onChange={handlePrefixChange}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      <div className="viewer-actions">
        <Space size={4}>
          <FolderCreateWrap onCreateFolder={handlePutFolder}>
            <Button type="outline" size="small">
              新建目录
            </Button>
          </FolderCreateWrap>
          <Button type="outline" size="small">
            下载
          </Button>
          <Dropdown
            trigger="click"
            droplist={
              <Menu>
                <Menu.Item key="copy">复制到</Menu.Item>
                <Menu.Item key="move">移动到</Menu.Item>
                <Menu.Item key="remove">删除</Menu.Item>
              </Menu>
            }
          >
            <Button type="outline" size="small">
              更多 <IconDown />
            </Button>
          </Dropdown>
        </Space>
        <Space size={4}>
          <Input.Search style={{ width: '240px' }} />
          <Button onClick={handleGetObjects}> 刷新 </Button>
          <RadioGroup type="button" name="lang" value={display} onChange={handleDisplayChange}>
            <Radio value="list" style={{ fontSize: 'medium' }}>
              <IconList />
            </Radio>
            <Radio value="card" style={{ fontSize: 'medium' }}>
              <IconApps />
            </Radio>
          </RadioGroup>
        </Space>
      </div>
      <div className="viewer-content">
        <FileDropWrap>
          {display === ETabDisplay.LIST ? (
            <TableContent
              connectionId={connectionId}
              loading={loading}
              data={dataList}
              onPrefixChange={handlePrefixChange}
              onFileView={handleFileView}
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

export default LocalViewer;
