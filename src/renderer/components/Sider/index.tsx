import { Space, Divider, Tooltip } from 'antd';
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
        <Tooltip title={t('common.home')} placement="right">
          <IconFont
            className={`action ${isHome ? 'active' : undefined}`}
            pointer
            onClick={() => {
              selectTab('home');
              navigate('/');
            }}
            type="home"
          />
        </Tooltip>
      </div>
      <div className="sider-bottom">
        <Divider style={{ margin: '8px 0px' }} />
        <Space vertical size={16}>
          <Tooltip title={t('tasks.title')} placement="right">
            <IconFont
              className={`action ${isTasks ? 'active' : undefined}`}
              pointer
              onClick={() => navigate('/tasks')}
              type="transfer"
            />

            {/* <SwapOutlined className={isTasks ? 'active' : undefined} onClick={() => navigate('/tasks')} /> */}
          </Tooltip>
          {/* <Tooltip title="定时任务">
            <CalendarOutlined className={isSettingPage ? 'active' : undefined} onClick={() => navigate('/setting')} />
          </Tooltip> */}
          <Tooltip title={t('logs.title')} placement="right">
            {/* <ProfileOutlined className={isLogs ? 'active' : undefined} onClick={() => navigate('/logs')} /> */}

            <IconFont
              type="log"
              className={`action ${isLogs ? 'active' : undefined}`}
              pointer
              onClick={() => navigate('/logs')}
            />
          </Tooltip>
          {/* <Tooltip title="工具">
            <ToolOutlined
              className={isSettingPage ? 'active' : undefined}
              onClick={() => navigate('/setting')}
            />
          </Tooltip> */}
          <Tooltip title={t('settings.title')} placement="right">
            <IconFont
              type="setting"
              className={`action ${isSettingPage ? 'active' : undefined}`}
              onClick={() => navigate('/setting')}
            />
            {/* <SettingOutlined className={isSettingPage ? 'active' : undefined} onClick={() => navigate('/setting')} /> */}
          </Tooltip>
        </Space>
      </div>
    </aside>
  );
};

export default Sider;
