export const CHANNEL_NAME = `__CHANNEL_X__`;

import { StoreBrands, StoreTypes } from '@/types';

export const StoreDatas = [
  {
    brand: StoreBrands.aliyun,
    type: StoreTypes.OSS,
  },
  {
    brand: StoreBrands.local,
    type: StoreTypes.LOCAL,
  },
  {
    brand: StoreBrands.ftp,
    type: StoreTypes.FTP,
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
    brand: StoreBrands.WebDAV,
    type: StoreTypes.WEBDAV,
  },
];
