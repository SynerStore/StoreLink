import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Dropdown, Segmented } from 'antd';
import { LeftOutlined, RightOutlined, MenuOutlined, ProductOutlined, DownOutlined } from '@ant-design/icons';

import TableContent from './TableContent';
import CardContent from './CardContent';
import CreateFolderButton from '../../CreateFolderButton';
import { useConfigStore } from '@/renderer/store';
import { PathHistory, events, storeRequest } from '@/renderer/utils';
import { useLoading } from '@/renderer/hooks';
import './index.css';

export type ObjectStoreViewerProps = {
  id: string;
};
const ObjectStoreViewer = (props: ObjectStoreViewerProps) => {
  const [dataList, setDataList] = useState([]);
  const { loading, setLoading } = useLoading(false);
  const [display, setDisplay] = useState<'table' | 'card'>('table');
  const connections = useConfigStore((state: any) => state.connections);
  const [curPrefix, setCurPrefix] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<PathHistory | null>(null);
  const connection = useMemo(() => {
    const data = connections.find((item: any) => item.id === props.id);
    return data;
  }, [props.id]);

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
      id: connection.id,
      params: { prefix: curPrefix },
    });
    setLoading(false);
    if (res.success) {
      setDataList(res.data);
      console.log(res.data);
    }
  };

  const handlePrefixChange = (value: string) => {
    const prefix = pathHistory?.go(value) as string;
    setCurPrefix(prefix);
  };

  const handleFileView = (data: any) => {
    console.log('查看文件：', data.name);
  };

  const handleDownload = async (record: any) => {
    const targetPath = await events.getSingleDirPath({});
    if (targetPath) {
      storeRequest({
        method: 'get',
        id: connection.id,
        params: { fileInfo: record, targetPath },
      });
    }
  };

  const handleUpload = async () => {
    // 选择文件夹
    const localPaths = await events.getMultDirAndFilePath({});
    if (localPaths && localPaths.length) {
      storeRequest({
        method: 'put',
        id: connection.id,
        params: { localPaths, targetPath: curPrefix },
      });
    }
  };

  const handlePutFolder = async (folderName: string) => {
    storeRequest({
      method: 'putFolder',
      id: connection.id,
      params: { folderName, targetPath: curPrefix },
    });
  };

  useEffect(() => {
    if (connection) {
      // 发起请求了
      handleGetObjects();
    }
  }, [connection, curPrefix]);

  useEffect(() => {
    const instance = new PathHistory({ path: curPrefix });
    setPathHistory(instance);
  }, []);

  return (
    <div className="viewer">
      <div className="viewer-path">
        <Flex gap={2}>
          <Button disabled={!canBack} icon={<LeftOutlined />} onClick={handlePathBack} />
          <Button disabled={!canForward} icon={<RightOutlined />} onClick={handlePathForward} />
        </Flex>
        <div className="viewer-path-input">
          <Flex gap={4}>
            <Input style={{ width: '100%' }} />
            <Input.Search style={{ width: '240px' }} />
            <Button onClick={handleGetObjects}> 刷新 </Button>
          </Flex>
        </div>
      </div>
      <div className="viewer-actions">
        <Flex gap={4}>
          <Button type="primary" onClick={handleUpload}>
            上传
          </Button>
          <CreateFolderButton onCreateFolder={handlePutFolder} />
          <Button> 下载 </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制到' },
                { key: 'move', label: '移动到' },
                { key: 'remove', label: '删除' },
              ],
            }}
          >
            <Button icon={<DownOutlined />} iconPosition="end">
              更多
            </Button>
          </Dropdown>
        </Flex>
        <Flex gap={4}>
          <Segmented
            options={[
              { value: 'List', icon: <MenuOutlined /> },
              { value: 'Kanban', icon: <ProductOutlined /> },
            ]}
          />
        </Flex>
      </div>
      <div className="viewer-content">
        {display === 'table' ? (
          <TableContent
            loading={loading}
            data={dataList}
            onPrefixChange={handlePrefixChange}
            onFileView={handleFileView}
            onDownload={handleDownload}
          />
        ) : null}
        {display === 'card' ? <CardContent /> : null}
      </div>
      <div className="viewer-footer">
        <span>已选 0 项，已拉取 200 项 </span>
      </div>
    </div>
  );
};

export default ObjectStoreViewer;
