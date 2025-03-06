import { useMemo } from 'react';
import { Menu, Input } from 'antd';

import { useConfigStore, useTabsStore } from '@/renderer/store';
import './index.css';

const Search = Input.Search;
const StoreSider = () => {
  const connections = useConfigStore((state: any) => state.connections);
  const { tabs, activeTab, addTab } = useTabsStore();

  const items = useMemo(() => {
    return connections.map((item: any) => {
      return {
        key: item.id,
        label: item.name,
      };
    });
  }, [connections]);
  const handleClick = ({ key }: any) => {
    addTab({
      id: key,
      name: key,
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
