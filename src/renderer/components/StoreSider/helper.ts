import { Connection } from '@/renderer/store/useConfigStore';
export const filterConnections = (connections: Connection[], searchKey: string) => {
  return connections.filter((connection: Connection) => connection.name.includes(searchKey));
};
