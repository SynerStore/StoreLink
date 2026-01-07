import { Space, Divider } from 'antd';
import {
  SettingOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  SwapOutlined,
  MessageOutlined,
  ToolOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import SettingPanel from '../SettingPanel';
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

  return (
    <aside className="sider">
      <div className="sider-top">
        {fold ? <MenuUnfoldOutlined onClick={onFold} /> : <MenuFoldOutlined onClick={onFold} />}
        <Divider style={{ margin: '8px 0px' }} />
        <HomeOutlined style={{ color: 'var(--primary-color)' }} onClick={() => {
            selectTab('home');
            navigate('/');
        }} />
      </div>
      <div className="sider-bottom">
        <Divider style={{ margin: '8px 0px' }} />
        <Space vertical size={16}>
          <SwapOutlined onClick={() => navigate('/tasks')} />
          {/* <MessageOutlined /> */}
          {/* <ToolOutlined /> */}
          <SettingPanel>
            <SettingOutlined />
          </SettingPanel>
        </Space>
      </div>
    </aside>
  );
};

export default Sider;
