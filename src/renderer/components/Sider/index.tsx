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

export type SiderProps = {
  onFold: () => void;
  fold: boolean;
};
const Sider = (props: SiderProps) => {
  const { onFold, fold } = props;
  const { selectTab } = useTabsStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isTasks = location.pathname.startsWith('/tasks');
  const isLogs = location.pathname.startsWith('/logs');
  const isSettingPage = location.pathname.startsWith('/setting');

  return (
    <aside className="sider">
      <div className="sider-top">
        {fold ? (
          <Tooltip title="展开侧边栏">
            <MenuUnfoldOutlined onClick={onFold} />
          </Tooltip>
        ) : (
          <Tooltip title="收起侧边栏">
            <MenuFoldOutlined onClick={onFold} />
          </Tooltip>
        )}
        <Divider style={{ margin: '8px 0px' }} />
        <Tooltip title="首页">
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
          <Tooltip title="任务">
            <SwapOutlined className={isTasks ? 'active' : undefined} onClick={() => navigate('/tasks')} />
          </Tooltip>
          {/* <Tooltip title="定时任务">
            <CalendarOutlined className={isSettingPage ? 'active' : undefined} onClick={() => navigate('/setting')} />
          </Tooltip> */}
          <Tooltip title="日志">
            <ProfileOutlined className={isLogs ? 'active' : undefined} onClick={() => navigate('/logs')} />
          </Tooltip>
          {/* <Tooltip title="工具">
            <ToolOutlined
              className={isSettingPage ? 'active' : undefined}
              onClick={() => navigate('/setting')}
            />
          </Tooltip> */}
          <Tooltip title="设置">
            <SettingOutlined className={isSettingPage ? 'active' : undefined} onClick={() => navigate('/setting')} />
          </Tooltip>
        </Space>
      </div>
    </aside>
  );
};

export default Sider;
