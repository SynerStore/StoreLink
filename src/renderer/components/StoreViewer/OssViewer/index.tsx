import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Dropdown, Space, Menu } from '@arco-design/web-react';
import { IconLeft, IconRight, IconDown } from '@arco-design/web-react/icon';

import TableContent from './TableContent';
import CardContent from './CardContent';
import FolderCreateWrap from '@/renderer/components/FolderCreateWrap';
import ViewInput from '@/renderer/components/ViewInput';
import { useConfigStore } from '@/renderer/store';
import { PathHistory, events, storeRequest } from '@/renderer/utils';
import { useLoading } from '@/renderer/hooks';
import './index.css';

export type ObjectStoreViewerProps = {
  id: string;
};
const OssViewer = (props: ObjectStoreViewerProps) => {
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

  const handleDelete = async (files: any) => {
    const deletFiles = Array.isArray(files) ? files : [files];
    storeRequest({
      method: 'delete',
      id: connection.id,
      params: { deletFiles },
    });
  };

  const handleRename = async (fileInfo: any, newName: string) => {
    storeRequest({
      method: 'rename',
      id: connection.id,
      params: { fileInfo, newName },
    });
  };

  useEffect(() => {
    if (connection) {
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
        <Space size={2}>
          <Button disabled={!canBack} icon={<IconLeft />} onClick={handlePathBack} />
          <Button disabled={!canForward} icon={<IconRight />} onClick={handlePathForward} />
        </Space>
        <div className="viewer-path-input">
          <Space size={4}>
            <ViewInput value={curPrefix} onChange={handlePrefixChange} style={{ width: '100%' }} />
            <Input.Search style={{ width: '240px' }} />
            <Button onClick={handleGetObjects}> 刷新 </Button>
          </Space>
        </div>
      </div>
      <div className="viewer-actions">
        <Space size={4}>
          <Button type="primary" onClick={handleUpload}>
            上传
          </Button>
          <FolderCreateWrap onCreateFolder={handlePutFolder}>
            <Button> 新建目录 </Button>
          </FolderCreateWrap>
          <Button> 下载 </Button>
          <Dropdown
            droplist={
              <Menu>
                <Menu.Item key="copy">复制到</Menu.Item>
                <Menu.Item key="move">移动到</Menu.Item>
                <Menu.Item key="remove">删除</Menu.Item>
              </Menu>
            }
          >
            <Button icon={<IconDown />}>更多</Button>
          </Dropdown>
        </Space>
        <Space size={4}>
          {/* <Segmented
            options={[
              { value: 'List', icon: <MenuOutlined /> },
              { value: 'Kanban', icon: <ProductOutlined /> },
            ]}
          /> */}
        </Space>
      </div>
      <div className="viewer-content">
        {display === 'table' ? (
          <TableContent
            loading={loading}
            data={dataList}
            onPrefixChange={handlePrefixChange}
            onFileView={handleFileView}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onRename={handleRename}
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

export default OssViewer;
