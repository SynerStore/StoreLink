import Store from 'electron-store';

import { getUserDataPath } from '@/main/utils';

export interface IViewerData {
  activeTab: string;
  tabs: any[];
}

export const DEFAULT_VIEWER_DATA: IViewerData = {
  activeTab: 'home',
  tabs: [], // 连接
};

// 应用配置
const viewerStore = new Store<IViewerData>({
  name: 'viewer',
  cwd: getUserDataPath(),
  defaults: DEFAULT_VIEWER_DATA,
});

export function getViewerData(): IViewerData {
  // @ts-ignore
  return viewerStore.store;
}

export async function setViewerData(data: Partial<IViewerData>) {
  // @ts-ignore
  viewerStore.store = {
    // @ts-ignore
    ...viewerStore.store,
    ...data,
  };
}
