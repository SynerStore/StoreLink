import OSS from 'ali-oss';

import { BaseStore } from '../baseStore';

class OssStore extends BaseStore {
  public client: any;
  constructor(config: any) {
    super(config);
    this.init(config);
  }

  init(config: any) {
    const { secretId, secretKey, bucket, id } = config;
    this.id = id;
    this.client = new OSS({
      accessKeyId: secretId, // 推荐使用环境变量获取；用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
      accessKeySecret: secretKey,
      bucket: bucket,
    });
  }

  async test() {
    try {
      // 列举当前账号所有地域下的存储空间。
      const result = await this.client.listV2({ 'max-keys': 1 });
      if (result?.res?.status === 200) {
        return {
          success: true,
          message: '连接成功',
        };
      } else {
        return {
          success: false,
          message: '链接失败',
        };
      }
    } catch (err: any) {
      console.log(err);
      return {
        success: false,
        message: err.message,
      };
    }
  }

  async list() {
    try {
      const result = await this.client.listV2({ 'max-keys': 1000 });
      return result?.objects || [];
    } catch (err: any) {
      console.log(err);
      return [];
    }
  }
}

export default OssStore;
