import { create } from 'zustand';

export type Tab = {
  id: string;
  name: string;
};

// 账号连接的更新
export const useTabsStore = create((set) => ({
  activeTab: 'home',
  tabs: [], // 连接
  addTab: (tab: Tab) => {
    return set((state: any) => {
      if (state.tabs.find((c: any) => c.id === tab.id)) {
        return {
          tabs: state.tabs,
          activeTab: tab.id,
        };
      } else {
        return {
          tabs: [...state.tabs, tab],
          activeTab: tab.id,
        };
      }
    });
  },
  selectTab: (id: string) => {
    return set((state: any) => {
      return {
        ...state,
        activeTab: id,
      };
    });
  },
  removeTab: (id: Tab) => {
    return set((state: any) => {
      const newTabs = state.tabs.filter((c: any) => c.id !== id);
      return {
        tabs: newTabs,
        activeTab: 'home',
      };
    });
  },
}));
