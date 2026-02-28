import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EChannels } from '@/types/channel';

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
    siderWidth: number;
    systemNotification: boolean;
    version: string;
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
        siderWidth: 240,
        systemNotification: true,
        version: '0.0.0',
      },

      initializeData: async () => {
        const data = await events.getSettingData();
        // 获取应用版本
        let version = '0.0.0';
        try {
          // @ts-ignore
          version = await window.electronBridge?.dispatch(EChannels.getAppVersion);
        } catch (e) {
          // 开发环境可能没有版本
        }
        if (!data) return;
        return set((state: any) => {
          return {
            settings: {
              ...state.settings,
              ...data,
              version,
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
