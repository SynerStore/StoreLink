import OSS from 'ali-oss';
import mime from 'mime-types';
import path from 'node:path';
import fs from 'node:fs';
import { Buffer } from 'node:buffer';

import { BaseStore } from '../baseStore';
import { sucessResponse, errorResponse, readDirectoryRecursive, isDirectory } from '@/main/utils';
import { StoreObjectData } from '@/types';

class OssStore extends BaseStore {
  public client: any;
  constructor(config: any) {
    super(config);
    this.init(config);
  }

  init(config: any) {
    const { secretId, secretKey, bucket } = config;
    this.id = `${secretId}-${secretKey}-${bucket}`;
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

  async list({ prefix }: { prefix: string }) {
    try {
      const result = await this.client.listV2({ 'max-keys': 1000, delimiter: '/', prefix });
      if (result.res.status === 200) {
        const { prefixes, objects } = result;
        // console.log('result:', result);
        const dirs: StoreObjectData[] = (prefixes || []).map((prefix: string) => {
          const basename = path.basename(prefix);
          // console.log('basename', basename);
          return {
            name: basename,
            path: prefix,
            encodePath: encodeURIComponent(prefix),
            isDir: true,
          };
        });
        const files: StoreObjectData[] = (objects || [])
          .map((object: any) => {
            const basename = path.basename(object.name);
            return {
              ...object,
              name: basename,
              path: object.name,
              encodePath: encodeURIComponent(object.name),
              isDir: false,
              mime: mime.lookup(object.name),
            };
          })
          .filter((object: any) => !object.path.endsWith('/')); // 过滤掉空文件夹
        const data = [...dirs, ...files];
        return sucessResponse(data);
      }
      return errorResponse(result?.res?.statusMessage);
    } catch (err: any) {
      console.log(err);
      return errorResponse(err.message);
    }
  }

  async get(params: any) {
    const { fileInfo, targetPath } = params;
    const remotePath = fileInfo.path;
    const targetFilePath = path.join(targetPath, path.basename(remotePath));
    if (!fileInfo.isDir) {
      const result = await this.client.getStream(remotePath, {
        timeout: 1000 * 60 * 60 * 24,
      });
      result.stream.pipe(fs.createWriteStream(targetFilePath));
    } else {
      await this.getFolder(remotePath, targetFilePath);
    }
  }

  // 下载文件夹
  private async getFolder(remotePath: string, localPath: string, _nextMarker?: any) {
    try {
      // 1. 创建本地目录
      if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath, { recursive: true });
      }

      // 2. 遍历OSS目录
      let result = await this.client.list(
        {
          prefix: remotePath.endsWith('/') ? remotePath : remotePath + '/',
          delimiter: '/',
          'max-keys': 1000, // 最大分页数
        },
        {},
      );

      // 3. 处理目录结构
      if (Array.isArray(result.prefixes)) {
        for (const subDir of result.prefixes) {
          const subLocalPath = path.join(localPath, subDir.replace(remotePath, ''));
          await this.getFolder(subDir, subLocalPath);
        }
      }

      // 4. 下载文件
      for (const file of result.objects) {
        if (!file.name.endsWith('/')) {
          // 过滤目录标记
          const fileName = path.basename(file.name);
          const localFilePath = path.join(localPath, fileName);

          // 流式下载（适合大文件）
          const stream = await this.client.getStream(file.name);
          const writer = fs.createWriteStream(localFilePath);
          stream.stream.pipe(writer);

          console.log(`Downloaded: ${file.name} → ${localFilePath}`);
        }
      }

      // 5. 处理分页
      if (result.isTruncated) {
        await this.getFolder(remotePath, localPath, result.nextMarker);
      }
    } catch (err) {
      console.error('下载失败:', err);
    }
  }

  // 上传
  async put(params: any) {
    const { localPaths, targetPath } = params;
    // 选择路径
    console.log('选择路径', localPaths);
    const paths = await readDirectoryRecursive(localPaths);
    console.log('上传路径', paths);
    for (const file of paths) {
      const filePath = file.fullPath; // 本地路径
      const remotePath = path.join(targetPath, file.path); // 拼接远程路径
      await this.putFile(filePath, remotePath);
    }
  }

  async putFile(localPath: string, remotePath: string) {
    console.log('上传文件路径', localPath);
    console.log('远程文件路径', remotePath);
    if (await isDirectory(localPath)) {
      const targetPath = remotePath.endsWith('/') ? remotePath : remotePath + '/';
      const result = await this.client.put(targetPath, Buffer.from(''));
      console.log('上传结果', result.name);
    } else {
      const stream = fs.createReadStream(localPath);
      const result = await this.client.putStream(remotePath, stream);
      console.log('上传结果', result.name);
    }
  }

  async putFolder(params: any) {
    const { folderName, targetPath } = params;
    const remotePath = path.join(targetPath, folderName, '/'); // 拼接远程路径
    const result = await this.client.put(remotePath, Buffer.from(''));
    console.log('上传结果', result.name);
  }
}

export default OssStore;
