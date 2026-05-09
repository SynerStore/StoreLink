import { Space, Divider, Tooltip, Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import { IconFont } from '@/renderer/components';

import { useNavigate, useLocation } from 'react-router-dom';
import { useTabsStore } from '@/renderer/store';
import './index.css';

const Sider = () => {
  const { selectTab } = useTabsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isHome = location.pathname === '/';
  const isTasks = location.pathname.startsWith('/tasks');
  const isLogs = location.pathname.startsWith('/logs');
  const isSettingPage = location.pathname.startsWith('/setting');

  return (
    <aside className="sider">
      <div className="sider-top">
        <IconFont
          className={`action ${isHome ? 'active' : ''}`}
          pointer
          size={24}
          onClick={() => {
            navigate('/');
          }}
          type="home"
        />
      </div>
      <div className="sider-bottom">
        <Divider style={{ margin: '8px 0px' }} />

        <Space vertical size={16}>
          <IconFont
            className={`action ${isTasks ? 'active' : ''}`}
            pointer
            size={24}
            onClick={() => navigate('/tasks')}
            type="transfer"
          />

          {/* <SwapOutlined className={isTasks ? 'active' : ''} onClick={() => navigate('/tasks')} /> */}

          {/* <Tooltip title="定时任务">
            <CalendarOutlined className={isSettingPage ? 'active' : ''} onClick={() => navigate('/setting')} />
          </Tooltip> */}

          {/* <ProfileOutlined className={isLogs ? 'active' : ''} onClick={() => navigate('/logs')} /> */}

          <IconFont
            type="log"
            className={`action ${isLogs ? 'active' : ''}`}
            pointer
            size={24}
            onClick={() => navigate('/logs')}
          />

          {/* <Tooltip title="工具">
            <ToolOutlined
              className={isSettingPage ? 'active' : ''}
              onClick={() => navigate('/setting')}
            />
          </Tooltip> */}
          <IconFont
            type="setting"
            size={24}
            className={`action ${isSettingPage ? 'active' : ''}`}
            onClick={() => navigate('/setting')}
          />
        </Space>
      </div>
    </aside>
  );
};

export default Sider;
