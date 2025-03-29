import React from 'react';

import AliyunIcon from '../../assets/store-icons/aliyun.png';
import S3Icon from '../../assets/store-icons/s3.png';
import FtpIcon from '../../assets/store-icons/ftp.png';
import DiskIcon from '../../assets/store-icons/disk.webp';
import HuaweiIcon from '../../assets/store-icons/huaweicloud.png';
import TencentIcon from '../../assets/store-icons/tencentcloud.png';

export type FileIconProps = {
  size?: string | number;
  brand: string;
  styles: React.CSSProperties;
};

const StoreIcon = (props: FileIconProps) => {
  const { size = 18, brand, styles = {} } = props;

  const getFileIcon = (brand: string) => {
    switch (brand) {
      case 'aliyun':
        return AliyunIcon;
      case 's3':
        return S3Icon;
      case 'ftp':
        return FtpIcon;
      case 'local':
        return DiskIcon;
      case 'huaweicloud':
        return HuaweiIcon;
      case 'tencentcloud':
        return TencentIcon;
      default:
        return DiskIcon;
    }
  };

  return <img style={{ height: size, width: size, ...styles }} src={getFileIcon(brand)} alt="Store Icon" />;
};

export default StoreIcon;
