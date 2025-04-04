import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { events } from '@/renderer/utils';

export type Tab = {
  id: string;
  name: string;
};

type DataType = {
  activeTab: string;
  tabs: Tab[];
  loading: boolean;
  initializeData: () => Promise<void>;
  addTab: (v: Tab) => Promise<void>;
  selectTab: (v: string) => Promise<void>;
  removeTab: (v: string) => Promise<void>;
};

// 账号连接的更新
export const useTabsStore = create<DataType>()(
  devtools(
    (set, get) => ({
      activeTab: 'home',
      tabs: [], // 连接
      loading: false,
      initializeData: async () => {
        set(() => ({ loading: true }));
        const res = await events.getViewerData();
        if (res) {
          set(() => ({ tabs: res.tabs || [], activeTab: res.activeTab, loading: false }));
        } else {
          set(() => ({ loading: false }));
        }
      },
      addTab: async (tab: Tab) => {
        const curTabs = get().tabs;
        const curActiveTab = get().activeTab;
        let newTabs = [...curTabs];
        let newActiveTab = curActiveTab;
        if (curTabs.find((c: any) => c.id === tab.id)) {
          newActiveTab = tab.id;
        } else {
          newTabs = [...curTabs, tab];
          newActiveTab = tab.id;
        }
        await events.updateViewerData({ tabs: newTabs, activeTab: newActiveTab });
        return set((state: any) => {
          return {
            ...state,
            tabs: newTabs,
            activeTab: newActiveTab,
          };
        });
      },
      selectTab: async (id: string) => {
        await events.updateViewerData({ activeTab: id });
        return set((state: any) => {
          return {
            ...state,
            activeTab: id,
          };
        });
      },
      removeTab: async (id: string) => {
        const curTabs = get().tabs;
        let newTabs = curTabs.filter((c: any) => c.id !== id);
        let newActiveTab = 'home';
        await events.updateViewerData({ tabs: newTabs, activeTab: newActiveTab });
        return set((state: any) => {
          return {
            ...state,
            tabs: newTabs,
            activeTab: newActiveTab,
          };
        });
      },
    }),
    {
      name: 'useTabsStore', // DevTools 中显示的名称
      enabled: process.env.NODE_ENV !== 'production', // 生产环境禁用
    },
  ),
);
