// 存放窗口信息相关
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface WindowState {
  storeSiderfold: boolean;
  toggleStoreSiderfold: () => void;
  responsiveGridCardWidth: number | undefined;
  setResponsiveGridCardWidth: (width: number) => void;
}

export const useWindowStore = create<WindowState>()(
  devtools((set) => ({
    storeSiderfold: false,
    toggleStoreSiderfold: () => set((state) => ({ storeSiderfold: !state.storeSiderfold })),
    responsiveGridCardWidth: undefined,
    setResponsiveGridCardWidth: (width: number) => set({ responsiveGridCardWidth: width }),
  })),
);
