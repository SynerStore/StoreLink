export const CHANNEL_NAME = `__CHANNEL_X__`;

import { StoreBrands, StoreTypes } from '@/types';

export const StoreDatas = [
  {
    brand: StoreBrands.local,
    type: StoreTypes.LOCAL,
  },
  {
    brand: StoreBrands.S3,
    type: StoreTypes.S3,
  },
  {
    brand: StoreBrands.tencentcloud,
    type: StoreTypes.S3,
  },
  {
    brand: StoreBrands.huaweicloud,
    type: StoreTypes.S3,
  },
  {
    brand: StoreBrands.aliyun,
    type: StoreTypes.OSS,
  },
  {
    brand: StoreBrands.sftp,
    type: StoreTypes.SFTP,
  },
  {
    brand: StoreBrands.WebDAV,
    type: StoreTypes.WEBDAV,
  },
  {
    brand: StoreBrands.synology,
    type: StoreTypes.SYNOLOGY,
  },
];

export const StoreBrandsLabelMap = {
  [StoreBrands.S3]: 'S3 Storage',
  [StoreBrands.aliyun]: '阿里云 OSS',
  [StoreBrands.sftp]: 'SFTP Storage',
  [StoreBrands.local]: '本地存储',
  [StoreBrands.huaweicloud]: '华为云 OBS',
  [StoreBrands.tencentcloud]: '腾讯云 COS',
  [StoreBrands.WebDAV]: 'WebDAV Storage',
  [StoreBrands.synology]: 'Synology Storage',
};
