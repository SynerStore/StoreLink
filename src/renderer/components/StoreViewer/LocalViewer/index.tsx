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
import './index.css';

const RadioGroup = Radio.Group;

export type LocalViewerProps = {
  connectionId: string;
  data: any;
};
const LocalViewer = (props: LocalViewerProps) => {
  const { connectionId, data } = props;
  const [dataList, setDataList] = useState([]);
  const { loading, setLoading } = useLoading(false);
  const [display, setDisplay] = useState<'list' | 'card'>('list');
  const [curPrefix, setCurPrefix] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<PathHistory | null>(null);

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
    const nextPath = value.replace(data.config.root, '');
    const prefix = pathHistory?.go(nextPath) as string;
    setCurPrefix(prefix);
  };

  const handleFileView = (data: any) => {
    console.log('查看文件：', data.name);
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
            prefix={data.config.root}
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
          <RadioGroup type="button" name="lang" defaultValue="list">
            <Radio value="list">
              <IconList />
            </Radio>
            <Radio value="card">
              <IconApps />
            </Radio>
          </RadioGroup>
        </Space>
      </div>
      <div className="viewer-content">
        <FileDropWrap>
          {display === 'list' ? (
            <TableContent
              loading={loading}
              data={dataList}
              onPrefixChange={handlePrefixChange}
              onFileView={handleFileView}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ) : null}
          {display === 'card' ? <CardContent /> : null}
        </FileDropWrap>
      </div>
      <div className="viewer-footer">
        <span>已选 0 项，已拉取 200 项 </span>
      </div>
    </div>
  );
};

export default LocalViewer;
