import { useMemo, forwardRef } from 'react';

import S3Form from './S3Form';
import OssForm from './OssForm';
import FtpForm from './FtpForm';
import LocalForm from './LocalForm';

import { StoreTypes } from '@/types';
import { StoreBrands } from '@/constants';

export type StoreConnectFormProps = {
  brand: string;
};
const StoreConnectForm = forwardRef((props: StoreConnectFormProps, ref) => {
  const { brand } = props;

  const store: any = useMemo(() => {
    return StoreBrands.find((item: any) => item.brand === brand);
  }, [brand]);

  switch (store.type) {
    case StoreTypes.OSS:
      return <OssForm ref={ref} />;
    case StoreTypes.S3:
      return <S3Form />;
    case StoreTypes.FTP:
      return <FtpForm />;
    case StoreTypes.LOCAL:
      return <LocalForm />;
    default:
      return null;
  }
});

export default StoreConnectForm;
