import { useMemo } from 'react';
import { Menu, Input } from '@arco-design/web-react';

import { useConfigStore, useTabsStore } from '@/renderer/store';
import './index.css';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
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
            key: `${connection.id}/${bucket}`,
            label: bucket,
          };
        }),
      };
    });
  }, [connections]);

  const handleClick = (key: string) => {
    const [connectionId, name] = key.split('/'); // 解构层级
    addTab({
      id: key,
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
          autoOpen
          autoScrollIntoView
          selectable
          onClickMenuItem={handleClick}
          style={{ width: '100%' }}
          selectedKeys={[activeTab]}
        >
          {items.map((item: any) => {
            return (
              <SubMenu key={item.key} title={item.label}>
                {item.children.map((child: any) => {
                  return <MenuItem key={child.key}> {child.label}</MenuItem>;
                })}
              </SubMenu>
            );
          })}
        </Menu>
      </div>
    </div>
  );
};

export default StoreSider;
