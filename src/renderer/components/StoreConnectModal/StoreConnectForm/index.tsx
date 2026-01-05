import { useMemo, forwardRef } from 'react';

import S3Form from './S3Form';
import OssForm from './OssForm';
import SFtpForm from './SFtpForm';
import LocalForm from './LocalForm';
import WebDAVForm from './WebDAVForm';
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
    case StoreTypes.SFTP:
      return <SFtpForm ref={ref} />;
    case StoreTypes.LOCAL:
      return <LocalForm ref={ref} />;
    case StoreTypes.WEBDAV:
      return <WebDAVForm ref={ref} />;
    default:
      return null;
  }
});

export default StoreConnectForm;
