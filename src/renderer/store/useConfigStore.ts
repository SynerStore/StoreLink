import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

import { events } from '@/renderer/utils';

export type Connection = {
  id?: string;
  type: string;
  brand: string;
  name: string;
  isCollected?: boolean;
  config: Record<string, any>;
  createDate?: string;
  updateDate?: string;
};

type DataState = {
  connections: Connection[];
  loading: boolean;
  initializeData: () => Promise<void>;
  removeConnection: (v: string) => void;
  updateConnection: (v: Connection) => void;
  addConnection: (v: Connection | Connection[]) => Promise<void>;
};

// 使用泛型参数明确类型定义
export const useConfigStore = create<DataState>()(
  devtools(
    (set, get) => ({
      connections: [], // 连接
      loading: false,
      initializeData: async () => {
        set(() => ({ loading: true }));
        const res = await events.getConnectionsData();
        if (res) {
          set(() => ({ connections: res.connections || [], loading: false }));
        } else {
          set(() => ({ loading: false }));
        }
      },
      addConnection: async (connection: Connection | Connection[]) => {
        if (!Array.isArray(connection)) {
          connection = [connection];
        }
        const newConnections = connection.map((con: Connection) => ({
          ...con,
          id: con.id || uuidv4(), // 确保 id 唯一性
          createDate: con.createDate || new Date().toLocaleString(),
          updateDate: new Date().toLocaleString(),
        }));
        await events.addConnection(newConnections);
        await get().initializeData()
        return newConnections; // 返回新增 connect 用于创建 tab
      },
      removeConnection: async (id: string) => {
        await events.removeConnection(id);
        await get().initializeData()
      },
      updateConnection: (connection: Connection) => {
        set((state) => ({
          connections: state.connections.map((c) =>
            c.id === connection.id ? { ...connection, updateDate: new Date().toLocaleString() } : c,
          ),
        }));
      },
    }),
    {
      name: 'useConfigStore', // DevTools 中显示的名称
      enabled: process.env.NODE_ENV !== 'production', // 生产环境禁用
    },
  ),
);
