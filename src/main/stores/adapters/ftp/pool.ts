import FtpStore from './store';

class FtpPool {
  private busyPool: Set<FtpStore>;
  private idlePool: Set<FtpStore>;
  public config: any;
  public id: string;

  constructor(id: string, config: any) {
    this.id = id;
    this.config = config;
    this.busyPool = new Set();
    this.idlePool = new Set();
  }

  // 获取一个ftp store
  async getStore() {
    if (this.idlePool.size > 0) {
      const store = this.idlePool.values().next().value as FtpStore;
      this.busyPool.add(store);
      return store;
    } else {
      const store = new FtpStore(this.id, this.config); // 继承 ftppool 的id
      this.busyPool.add(store);
      return store;
    }
  }

  // 释放一个ftp store
  async releaseStore(store: FtpStore) {
    this.busyPool.delete(store);
    this.idlePool.add(store);
  }
}

export default FtpPool;
