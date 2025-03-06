import { useEffect, useMemo } from 'react';
import { Button, Flex, Input, Dropdown, Segmented } from 'antd';
import { LeftOutlined, RightOutlined, MenuOutlined, ProductOutlined } from '@ant-design/icons';

import TableContent from './TableContent';
import { useConfigStore } from '@/renderer/store';
import { EChannels } from '@/types';
import './index.css';

export type ObjectStoreViewerProps = {
  id: string;
};
const ObjectStoreViewer = (props: ObjectStoreViewerProps) => {
  /**
   * 1、发送信号到后台获取文档列表等
   * 2、后台到连接池拿到客户端，假如没有客户端则点击新建
   * 3、拿到客户端实例后根据所传参数调用实例接口
   * 4、返回数据并渲染
   * */
  const connections = useConfigStore((state: any) => state.connections);

  const connection = useMemo(() => {
    const data = connections.find((item: any) => item.id === props.id);
    return data;
  }, [props.id]);

  const handleGetObjects = async () => {
    if (window?.['electronBridge']) {
      const data = await window.electronBridge.dispatch(EChannels.storeRequest, {
        method: 'list',
        id: connection.id,
        params: { prefix: '/' },
      });

      console.log(data);
    }
  };

  useEffect(() => {
    if (connection) {
      // 发起请求了
      handleGetObjects();
    }
  }, [connection]);

  return (
    <div className="viewer">
      <div className="viewer-path">
        <Flex gap={2}>
          <Button disabled icon={<LeftOutlined />} />
          <Button icon={<RightOutlined />} />
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
          <Button type="primary"> 上传 </Button>
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
        <TableContent />
      </div>
      <div className="viewer-footer">
        <span>已选 0 项，已拉取 200 项 </span>
      </div>
    </div>
  );
};

export default ObjectStoreViewer;
