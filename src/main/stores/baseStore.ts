export class BaseStore {
  public id: string;
  public client: any;
  public config: any;
  constructor(config: any) {
    this.id = Math.random().toString(36).substring(2);
    this.config = config;
    this.init(config);
  }

  // 初始化
  init(config: any) {
    console.log(config);
    this.client = {};
  }

  // 测试链接
  test() {}

  // 获取存储信息
  getStoreInfo() {}

  // 列表
  list(props: any) {
    console.log('props', props);
  }

  // 删除
  async delete(params: any) {
    console.log('params', params);
  }

  // 上传
  async put(params: any) {
    console.log('params', params);
  }

  // 下载
  async get(params: any) {
    console.log('params', params);
  }
}
