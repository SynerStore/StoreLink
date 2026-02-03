import { useMemo, forwardRef } from 'react';

import S3Form from './S3Form';
import OssForm from './OssForm';
import CosForm from './CosForm';
import SFtpForm from './SFtpForm';
import LocalForm from './LocalForm';
import WebDAVForm from './WebDAVForm';
import SynologyForm from './SynologyForm';
import { StoreTypes } from '@/types';
import { StoreDatas } from '@/constants';

export type StoreConnectFormProps = {
  brand: string;
  mode?: 'create' | 'edit';
  initial?: any;
  onSubmit?: (conn: any) => Promise<any> | any;
};
const StoreConnectForm = forwardRef((props: StoreConnectFormProps, ref) => {
  const { brand, mode = 'create', initial, onSubmit } = props;

  const store: any = useMemo(() => {
    return StoreDatas.find((item: any) => item.brand === brand);
  }, [brand]);

  switch (store.type) {
    case StoreTypes.OSS:
      return <OssForm ref={ref} mode={mode} initial={initial} onSubmit={onSubmit} />;
    case StoreTypes.COS:
      return <CosForm ref={ref} mode={mode} initial={initial} onSubmit={onSubmit} />;
    case StoreTypes.S3:
      return <S3Form ref={ref} mode={mode} initial={initial} onSubmit={onSubmit} />;
    case StoreTypes.SFTP:
      return <SFtpForm ref={ref} mode={mode} initial={initial} onSubmit={onSubmit} />;
    case StoreTypes.LOCAL:
      return <LocalForm ref={ref} mode={mode} initial={initial} onSubmit={onSubmit} />;
    case StoreTypes.WEBDAV:
      return <WebDAVForm ref={ref} mode={mode} initial={initial} onSubmit={onSubmit} />;
    case StoreTypes.SYNOLOGY:
      return <SynologyForm ref={ref} mode={mode} initial={initial} onSubmit={onSubmit} />;
    default:
      return null;
  }
});

export default StoreConnectForm;
