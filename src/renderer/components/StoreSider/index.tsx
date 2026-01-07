import { useMemo, useState, useEffect, useRef } from 'react';
import { Menu, Input, Space, Tooltip } from 'antd';
import { groupBy } from 'lodash';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';

import { StoreConnectModal, ConnectionDeleteWrap, ContextMenu, ConnectionEditWrap } from '@/renderer/components';
import MenuTitle from './MenuTitle';
import { useConfigStore, useTabsStore, ETabDisplay } from '@/renderer/store';
import { StoreTypes } from '@/types';
import { storeRequest, storeRemove } from '@/renderer/utils';
import './index.css';

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

  const [statuses, setStatuses] = useState<Record<string, 'idle' | 'connecting' | 'success' | 'failed'>>({});
  const retryTimers = useRef<Record<string, any>>({});
  useEffect(() => {
    return () => {
      Object.values(retryTimers.current).forEach((t) => {
        try {
          clearTimeout(t);
        } catch {}
      });
      retryTimers.current = {};
    };
  }, []);

  const items = useMemo(() => {
    const groups = groupBy(connections, 'brand');
    return Reflect.ownKeys(groups).map((groupKey: any) => {
      return {
        key: String(groupKey),
        label: <MenuTitle brand={groupKey}>{groupKey}</MenuTitle>,
        children: groups[groupKey].map((connection: any) => {
          const id = String(connection.id);
          const isConnecting = statuses[id] === 'connecting';
          return {
            key: id,
            label: (
              <ContextMenu
                menu={[
                  {
                    render: () => (
                      <ConnectionEditWrap connection={connection}>
                        <Space size={2}>
                          <EditOutlined /> 编辑
                        </Space>
                      </ConnectionEditWrap>
                    ),
                  },
                  ...(connection.type === StoreTypes.LOCAL
                    ? []
                    : [
                        {
                          render: () => (
                            <Tooltip title="重新连接">
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reconnect({ key: id, ...connection });
                                }}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              >
                                <ReloadOutlined
                                  style={{
                                    fontSize: 14,
                                    color: statuses[id] === 'failed' ? 'var(--danger-color)' : 'var(--text-color)',
                                    transition: 'transform 0.3s ease',
                                    transform: isConnecting ? 'rotate(180deg)' : 'none',
                                  }}
                                />
                                重新连接
                              </span>
                            </Tooltip>
                          ),
                        },
                      ]),
                  {
                    render: () => (
                      <ConnectionDeleteWrap onDelete={handleDelete} connection={{ key: id, ...connection }}>
                        <Space size={2}>
                          <DeleteOutlined /> 删除
                        </Space>
                      </ConnectionDeleteWrap>
                    ),
                  },
                ]}
              >
                <span style={{ width: '100%', display: 'inline-flex', alignItems: 'center' }}>
                  {isConnecting ? (
                    <Tooltip title="连接中">
                      <span
                        style={{
                          display: 'inline-block',
                          width: 'clamp(4px, 0.4vw, 6px)',
                          height: 'clamp(4px, 0.4vw, 6px)',
                          borderRadius: '50%',
                          backgroundColor: '#faad14',
                          transition: 'background-color 0.2s ease',
                        }}
                      />
                    </Tooltip>
                  ) : null}
                  <span style={{ marginLeft: isConnecting ? 'clamp(4px, 0.6vw, 8px)' : 0 }}>{connection.name}</span>
                </span>
              </ContextMenu>
            ),
          };
        }),
      };
    });
  }, [connections, statuses]);

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

  const reconnect = async (child: any, attempt: number = 0) => {
    const id = child.key;
    setStatuses((s) => ({ ...s, [id]: 'connecting' }));
    try {
      await storeRemove(id);
      const result = await storeRequest({ id, method: 'test', params: {} });
      if (result?.success) {
        setStatuses((s) => ({ ...s, [id]: 'success' }));
      } else {
        throw new Error(result?.message || 'reconnect_failed');
      }
    } catch (_e) {
      if (attempt < 2) {
        const t = setTimeout(() => {
          reconnect(child, attempt + 1);
        }, 800 * (attempt + 1));
        retryTimers.current[id] = t;
      } else {
        setStatuses((s) => ({ ...s, [id]: 'failed' }));
      }
    }
  };

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
          items={items as any}
          onClick={({ key }) => handleClick(String(key))}
        />
      </div>
    </div>
  );
};

export default StoreSider;
