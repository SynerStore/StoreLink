import Store from 'electron-store';

import { getUserDataPath } from '@/main/utils';

export interface IConnectionsData {
  connections: any[];
}

export const DEFAULT_CONNECTIONS_DATA: IConnectionsData = {
  connections: [],
};

// 应用配置
export const connectionsStore = new Store<IConnectionsData>({
  name: 'connections',
  cwd: getUserDataPath(),
  defaults: DEFAULT_CONNECTIONS_DATA,
});

export function getConnectionsData(): IConnectionsData {
  // @ts-ignore
  return connectionsStore.store;
}

export async function setConnectionsData(data: Partial<IConnectionsData>) {
  // @ts-ignore
  connectionsStore.store = {
    // @ts-ignore
    ...connectionsStore.store,
    ...data,
  };
}
