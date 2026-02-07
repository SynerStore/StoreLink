import { App } from 'antd';
import { useEffect } from 'react';
import antdUtils from '@/renderer/utils/antd-utils';

const GlobalAntd = () => {
  const { message, notification, modal } = App.useApp();

  useEffect(() => {
    antdUtils.setMessage(message);
    antdUtils.setNotification(notification);
    antdUtils.setModal(modal);
  }, [message, notification, modal]);

  return null;
};

export default GlobalAntd;
