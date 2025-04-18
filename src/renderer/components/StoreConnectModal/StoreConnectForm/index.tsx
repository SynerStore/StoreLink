import { useMemo, forwardRef } from 'react';

import S3Form from './S3Form';
import OssForm from './OssForm';
import FtpForm from './FtpForm';
import LocalForm from './LocalForm';
import WebDAVForm from './WebDAVForm';
import SmbForm from './SmbForm';
import { StoreTypes } from '@/types';
import { StoreDatas } from '@/constants';

export type StoreConnectFormProps = {
  brand: string;
};
const StoreConnectForm = forwardRef((props: StoreConnectFormProps, ref) => {
  const { brand } = props;

  const store: any = useMemo(() => {
    return StoreDatas.find((item: any) => item.brand === brand);
  }, [brand]);

  switch (store.type) {
    case StoreTypes.OSS:
      return <OssForm ref={ref} />;
    case StoreTypes.S3:
      return <S3Form />;
    case StoreTypes.FTP:
      return <FtpForm />;
    case StoreTypes.LOCAL:
      return <LocalForm ref={ref} />;
    case StoreTypes.WEBDAV:
      return <WebDAVForm ref={ref} />;
      case StoreTypes.SMB:
        return <SmbForm ref={ref} />;
    default:
      return null;
  }
});

export default StoreConnectForm;
