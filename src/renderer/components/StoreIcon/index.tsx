import React from 'react';

import AliyunIcon from '@/renderer/assets/store-icons/aliyun.png';
import S3Icon from '@/renderer/assets/store-icons/s3.png';
import FtpIcon from '@/renderer/assets/store-icons/ftp.png';
import DiskIcon from '@/renderer/assets/store-icons/disk.webp';
import HuaweiIcon from '@/renderer/assets/store-icons/huaweicloud.png';
import TencentIcon from '@/renderer/assets/store-icons/tencentcloud.png';
import WebDAVIcon from '@/renderer/assets/store-icons/webdav.png';
import SmbIcon from '@/renderer/assets/store-icons/smb.png';
import { StoreBrands } from '@/types';

export type FileIconProps = {
  size?: string | number;
  brand: string;
  styles: React.CSSProperties;
};

const StoreIcon = (props: FileIconProps) => {
  const { size = 18, brand, styles = {} } = props;

  const getFileIcon = (brand: string) => {
    switch (brand) {
      case StoreBrands.aliyun:
        return AliyunIcon;
      case StoreBrands.S3:
        return S3Icon;
      case StoreBrands.ftp:
        return FtpIcon;
      case StoreBrands.local:
        return DiskIcon;
      case StoreBrands.huaweicloud:
        return HuaweiIcon;
      case StoreBrands.tencentcloud:
        return TencentIcon;
      case StoreBrands.WebDAV:
        return WebDAVIcon;
      case StoreBrands.SMB:
        return SmbIcon;
      default:
        return DiskIcon;
    }
  };

  return <img style={{ height: size, width: size, ...styles }} src={getFileIcon(brand)} alt="Store Icon" />;
};

export default StoreIcon;
