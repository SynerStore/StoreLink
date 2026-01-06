import { storePool } from '@/main/stores/storeManage';

export async function getActiveStoreCount() {
  return storePool.size;
}
