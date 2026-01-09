import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { events } from '@/renderer/utils';

export enum EnumTheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export enum EnumLang {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
}

type DataType = {
  settings: {
    lang: EnumLang;
    theme: EnumTheme;
    downloadPath: string;
  };
  initializeData: () => Promise<void>;
  update: (params: { [key: string]: any }) => Promise<void>;
};

// 设置配置信息
export const useSettingStore = create<DataType>()(
  devtools(
    (set) => ({
      settings: {
        lang: EnumLang.ZH_CN, // zh-CN | en-US
        theme: EnumTheme.LIGHT, // light | dark
        downloadPath: '',
      },

      initializeData: async () => {
        const data = await events.getSettingData();
        if (!data) return;
        return set((state: any) => {
          return {
            settings: {
              ...state.settings,
              ...data,
            },
          };
        });
      },

      update: async (params) => {
        await events.setSettingData(params);
        return set((state: any) => {
          return {
            settings: {
              ...state.settings,
              ...params,
            },
          };
        });
      },
    }),
    {
      name: 'settingStore',
      enabled: process.env.NODE_ENV !== 'production', // 生产环境禁用
    },
  ),
);
