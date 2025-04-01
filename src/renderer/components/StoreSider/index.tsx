import { useMemo } from 'react';
import { Menu, Input, Space } from '@arco-design/web-react';
import { groupBy } from 'lodash';
import { IconEdit, IconDelete, IconPlus } from '@arco-design/web-react/icon';

import StoreConnectModal from '@/renderer/components/StoreConnectModal';
import MenuTitle from './MenuTitle';
import ConnectionDeleteWrap from '@/renderer/components/ConnectionDeleteWrap';
import ContextMenu from '@/renderer/components/ContextMenu';
import { useConfigStore, useTabsStore } from '@/renderer/store';
import './index.css';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const Search = Input.Search;

const StoreSider = () => {
  const { connections, removeConnection } = useConfigStore();
  const { activeTab, addTab, removeTab } = useTabsStore();

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
    const connection: any = connections.find((item: any) => item.id === key);
    addTab({
      id: key,
      name: connection.name,
    });
  };

  /**
   * 删除链接
   * 删除tab
   * 删除链接实例
   * */
  const handleDelete = async (data: { key: string; label: string }) => {
    await removeConnection(data.key);
    removeTab(data.key);
  };

  //编辑
  const handleEdit = () => {};

  return (
    <div className="store-sider">
      <div className="store-sider-tip">
        <span>存储库</span>
        <StoreConnectModal>
          <div className="store-sider-tip-add">
            <IconPlus style={{ fontSize: 'medium' }} />
          </div>
        </StoreConnectModal>
      </div>
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
                  return (
                    <ContextMenu
                      key={child.key}
                      menu={[
                        {
                          icon: <IconEdit />,
                          text: '编辑',
                          onClick: () => {},
                        },
                        {
                          render: () => (
                            <ConnectionDeleteWrap onDelete={handleDelete} connection={child}>
                              <Space size={2}>
                                <IconDelete /> 删除
                              </Space>
                            </ConnectionDeleteWrap>
                          ),
                        },
                      ]}
                    >
                      <MenuItem key={child.key}>{child.label}</MenuItem>
                    </ContextMenu>
                  );
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
