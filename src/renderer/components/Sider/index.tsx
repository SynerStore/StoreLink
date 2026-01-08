import { Space, Divider, Tooltip } from 'antd';
import {
  SettingOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  SwapOutlined,
  MessageOutlined,
  CalendarOutlined,
  ToolOutlined,
  ProfileOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

import { useNavigate, useLocation } from 'react-router-dom';
import { useTabsStore } from '@/renderer/store';
import './index.css';
import { useTranslation } from 'react-i18next';

export type SiderProps = {
  onFold: () => void;
  fold: boolean;
};
const Sider = (props: SiderProps) => {
  const { onFold, fold } = props;
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
        {fold ? (
          <Tooltip title={t('sider.expand')}>
            <MenuUnfoldOutlined onClick={onFold} />
          </Tooltip>
        ) : (
          <Tooltip title={t('sider.collapse')}>
            <MenuFoldOutlined onClick={onFold} />
          </Tooltip>
        )}
        <Divider style={{ margin: '8px 0px' }} />
        <Tooltip title={t('common.home')}>
          <HomeOutlined
            className={isHome ? 'active' : undefined}
            onClick={() => {
              selectTab('home');
              navigate('/');
            }}
          />
        </Tooltip>
      </div>
      <div className="sider-bottom">
        <Divider style={{ margin: '8px 0px' }} />
        <Space vertical size={16}>
          <Tooltip title={t('tasks.title')}>
            <SwapOutlined className={isTasks ? 'active' : undefined} onClick={() => navigate('/tasks')} />
          </Tooltip>
          {/* <Tooltip title="定时任务">
            <CalendarOutlined className={isSettingPage ? 'active' : undefined} onClick={() => navigate('/setting')} />
          </Tooltip> */}
          <Tooltip title={t('logs.title')}>
            <ProfileOutlined className={isLogs ? 'active' : undefined} onClick={() => navigate('/logs')} />
          </Tooltip>
          {/* <Tooltip title="工具">
            <ToolOutlined
              className={isSettingPage ? 'active' : undefined}
              onClick={() => navigate('/setting')}
            />
          </Tooltip> */}
          <Tooltip title={t('settings.title')}>
            <SettingOutlined className={isSettingPage ? 'active' : undefined} onClick={() => navigate('/setting')} />
          </Tooltip>
        </Space>
      </div>
    </aside>
  );
};

export default Sider;
