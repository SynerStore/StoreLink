import { App, ConfigProvider } from 'antd';
import type { NotificationConfig } from 'antd/es/notification/interface';
import type { MessageConfig } from 'antd/es/message/interface';

// GlobalAntd 用于全局 antd 上下文配置
const GlobalAntd = () => {
  // 通知配置
  const notificationConfig: NotificationConfig = {
    placement: 'topRight',
    duration: 4,
    top: 60,
    style: {
      borderRadius: '12px',
      boxShadow: 'var(--shadow-lg)',
    },
  };

  // 消息配置
  const messageConfig: MessageConfig = {
    duration: 3,
    maxCount: 3,
    style: {
      marginTop: '60px',
    },
  };

  return (
    <ConfigProvider
      notification={notificationConfig}
      message={messageConfig}
    >
      <App />
    </ConfigProvider>
  );
};

export default GlobalAntd;
