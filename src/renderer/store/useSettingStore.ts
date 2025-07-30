import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  update: (params: { [key: string]: any }) => void;
};

// 设置配置信息
export const useSettingStore = create<DataType>()(
  devtools(
    (set) => ({
      settings: {
        lang: EnumLang.ZH_CN, // zh-CN | en-US
        theme: EnumTheme.LIGHT, // light | dark
      },

      update: (params) => {
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
