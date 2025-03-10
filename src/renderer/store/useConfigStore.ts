import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

import { events } from '@/renderer/utils';

export type Connection = {
  id: string;
  type: string;
  brand: string;
  authInfo: Record<string, any>;
  createDate?: string;
  updateDate?: string;
  subStores?: any[];
};

type DataState = {
  connections: Connection[];
  loading: boolean;
  initializeData: () => Promise<void>;
  removeConnection: (v: Connection) => void;
  updateConnection: (v: Connection) => void;
  addConnection: (v: Connection) => void;
};

// 账号连接的更新
export const useConfigStore = create<DataState>((set) => ({
  connections: [], // 连接
  loading: false,
  initializeData: async () => {
    set(() => ({ loading: true }));
    const res = await events.getConfData();
    set(() => ({ loading: true }));
    if (res) {
      return set(() => ({ connections: res.connections }));
    }
  },
  addConnection: (connection: Connection) => {
    return set((state: any) => ({
      connections: [
        ...state.connections,
        { connection, id: uuidv4(), createDate: new Date().toLocaleString(), updateDate: new Date().toLocaleString() },
      ],
    }));
  },
  removeConnection: (connection: Connection) => {
    return set((state: any) => ({ connections: state.connections.filter((c: any) => c.id !== connection.id) }));
  },
  updateConnection: (connection: Connection) => {
    return set((state: any) => ({
      connections: state.connections.map((c: any) =>
        c.id === connection.id ? { ...connection, updateDate: new Date().toLocaleString() } : c,
      ),
    }));
  },
}));
