import { useMemo, useState, useEffect } from 'react';
import { Menu, Input, Space } from 'antd';
import { groupBy } from 'lodash';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import { StoreConnectModal, ConnectionDeleteWrap, ContextMenu } from '@/renderer/components';
import MenuTitle from './MenuTitle';
import { useConfigStore, useTabsStore, ETabDisplay } from '@/renderer/store';
import './index.css';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const Search = Input.Search;

export type StoreSiderProps = {
  fold: boolean;
};
const StoreSider = (props: StoreSiderProps) => {
  const { fold } = props;
  const { connections, removeConnection } = useConfigStore();
  const { activeTab, addTab, removeTab } = useTabsStore();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const connection: any = connections.find((item: any) => item.id === activeTab);
    if (connection) {
      const key = connection.brand;
      setOpenKeys((prev) => {
        if (prev.includes(key)) return prev;
        return [...prev, key];
      });
    }
  }, [activeTab, connections]);

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
      display: ETabDisplay.LIST,
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
    <div className="store-sider" style={{ visibility: fold ? 'hidden' : 'visible' }}>
      <div className="store-sider-tip">
        <span>存储库</span>
        <StoreConnectModal>
          <div className="store-sider-tip-add">
            <PlusOutlined style={{ fontSize: 'medium' }} />
          </div>
        </StoreConnectModal>
      </div>
      <div className="store-sider-search">
        <Search />
      </div>

      <div className="store-sider-content">
        <Menu
          mode="inline"
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
          style={{ width: '100%' }}
          selectedKeys={[activeTab]}
        >
          {items.map((item: any) => {
            return (
              <SubMenu key={item.key} title={item.label}>
                {item.children.map((child: any) => {
                  return (
                    <MenuItem onClick={() => handleClick(child.key)} key={child.key}>
                      <ContextMenu
                        menu={[
                          {
                            icon: <EditOutlined />,
                            text: '编辑',
                            onClick: () => {},
                          },
                          {
                            render: () => (
                              <ConnectionDeleteWrap onDelete={handleDelete} connection={child}>
                                <Space size={2}>
                                  <DeleteOutlined /> 删除
                                </Space>
                              </ConnectionDeleteWrap>
                            ),
                          },
                        ]}
                      >
                        <span style={{ width: '100%', display: 'inline-block' }}>{child.label}</span>
                      </ContextMenu>
                    </MenuItem>
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
