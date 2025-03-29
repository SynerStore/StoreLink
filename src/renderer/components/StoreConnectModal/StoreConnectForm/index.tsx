import React, { useMemo } from 'react';

import S3Form from './S3Form';
import FtpForm from './FtpForm';
import LocalForm from './LocalForm';

import { StoreTypes } from '@/constants';

export type StoreConnectFormProps = {
  brand: string;
  onAddConnection?: (v: any) => void;
};
const StoreConnectForm = (props: StoreConnectFormProps) => {
  const { brand, onAddConnection } = props;
  const store: any = useMemo(() => {
    return StoreTypes.find((item) => item.brand === brand);
  }, [brand]);

  switch (store.type) {
    case 's3':
      return <S3Form />;
    case 'ftp':
      return <FtpForm />;
    case 'local':
      return <LocalForm />;
    default:
      return null;
  }
};

export default StoreConnectForm;
