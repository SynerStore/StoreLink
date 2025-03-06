import { ipcRenderer } from 'electron';
import { EChannels } from '@/types';

// 异步的
export default async function dispatch(channel: EChannels, data?: Record<string, any>) {
  return await ipcRenderer.invoke(channel, data);
}
