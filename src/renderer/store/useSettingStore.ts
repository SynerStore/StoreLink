import { create } from 'zustand';

// 设置配置信息
export const useSettingStore = create((set) => ({
  settings: {
    language: 'zh-CN',
    theme: 'light',
  },

  update: (key: string, value: any) => {
    return set((state: any) => {
      return {
        settings: {
          ...state.settings,
          [key]: value,
        },
      };
    });
  },
}));
