// 存放窗口信息相关
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface WindowState {
  responsiveGridCardWidth: number | undefined;
  setResponsiveGridCardWidth: (width: number) => void;
}

export const useWindowStore = create<WindowState>()(
  devtools((set) => ({
    responsiveGridCardWidth: undefined,
    setResponsiveGridCardWidth: (width: number) => set({ responsiveGridCardWidth: width }),
  })),
);
