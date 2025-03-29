import { useMemo } from 'react';
import { Menu, Input } from '@arco-design/web-react';
import { groupBy } from 'lodash';

import MenuTitle from './MenuTitle';
import { useConfigStore, useTabsStore } from '@/renderer/store';
import './index.css';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const Search = Input.Search;

const StoreSider = () => {
  const connections = useConfigStore((state: any) => state.connections);
  const { activeTab, addTab } = useTabsStore();

  const items = useMemo(() => {
    const groups = groupBy(connections, 'brand');
    return Reflect.ownKeys(groups).map((groupKey: any) => {
      return {
        key: groupKey,
        label: <MenuTitle brand={groupKey}>{groupKey}</MenuTitle>,
        children: groups[groupKey].map((connection: any) => {
          return {
            key: `${connection.id}`,
            label: connection.name,
          };
        }),
      };
    });
  }, [connections]);

  const handleClick = (key: string) => {
    const connection = connections.find((item: any) => item.id === key);
    addTab({
      id: key,
      name: connection.name,
      connectionId: key,
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
