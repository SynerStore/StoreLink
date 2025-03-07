import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Dropdown, Segmented, Upload } from 'antd';
import { LeftOutlined, RightOutlined, MenuOutlined, ProductOutlined } from '@ant-design/icons';

import TableContent from './TableContent';
import CardContent from './CardContent';
import { useConfigStore } from '@/renderer/store';
import { PathHistory, events, storeRequest } from '@/renderer/utils';
import './index.css';

export type ObjectStoreViewerProps = {
  id: string;
};
const ObjectStoreViewer = (props: ObjectStoreViewerProps) => {
  const [dataList, setDataList] = useState([]);
  const [display, setDisplay] = useState<'table' | 'card'>('table');
  const connections = useConfigStore((state: any) => state.connections);
  const [prefixs, setPrefixs] = useState<string[]>([]);
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
    const res = await storeRequest({
      method: 'list',
      id: connection.id,
      params: { prefix: curPrefix },
    });
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
    console.log(record);
    const targetPath = await events.getSingleDirPath({});
    console.log(targetPath);
    if (targetPath) {
      const res = storeRequest({
        method: 'get',
        id: connection.id,
        params: { filePath: record.path, targetPath },
      });
    }
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
            <Button> 刷新 </Button>
          </Flex>
        </div>
      </div>
      <div className="viewer-actions">
        <Flex gap={4}>
          <Upload>
            {' '}
            <Button type="primary"> 上传 </Button>
          </Upload>
          <Button> 新建目录 </Button>
          <Button> 下载 </Button>
          <Dropdown.Button
            menu={{
              items: [
                { key: 'copy', label: '复制到' },
                { key: 'move', label: '移动到' },
                { key: 'remove', label: '删除' },
              ],
            }}
          >
            更多
          </Dropdown.Button>
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
