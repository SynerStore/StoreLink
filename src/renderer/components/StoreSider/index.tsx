import { useMemo } from 'react';
import { Menu, Input } from 'antd';

import { useConfigStore, useTabsStore } from '@/renderer/store';
import './index.css';

const Search = Input.Search;
const StoreSider = () => {
  const connections = useConfigStore((state: any) => state.connections);
  const { activeTab, addTab } = useTabsStore();

  const items = useMemo(() => {
    return connections.map((connection: any) => {
      return {
        key: connection.id,
        label: connection.name,
        children: connection.buckets.map((bucket: any) => {
          return {
            key: bucket,
            label: bucket,
          };
        }),
      };
    });
  }, [connections]);

  const handleClick = ({ keyPath }: any) => {
    const [name, connectionId] = keyPath; // 解构层级
    addTab({
      id: `${connectionId}-${name}`,
      name: name,
      connectionId: connectionId,
    });
  };

  return (
    <div className="store-sider">
      <div className="store-sider-tip">存储库 </div>
      <div className="store-sider-search">
        <Search />
      </div>

      <div className="store-sider-content">
        <Menu
          onClick={handleClick}
          inlineIndent={16}
          style={{ width: '100%' }}
          selectedKeys={[activeTab]}
          mode="inline"
          items={items}
        />
      </div>
    </div>
  );
};

export default StoreSider;
