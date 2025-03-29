import { Space, Divider } from '@arco-design/web-react';
import { IconSettings, IconMenuFold, IconHome, IconSwap, IconMessage, IconTool } from '@arco-design/web-react/icon';

import SettingPanel from '../SettingPanel';

import './index.css';
const Sider = () => {
  return (
    <aside className="sider">
      <div className="sider-top">
        <IconMenuFold />
        <Divider style={{ margin: '8px 0px' }} />
        <IconHome />
      </div>

      <div className="sider-bottom">
        <Divider style={{ margin: '8px 0px' }} />
        <Space direction="vertical">
          <IconSwap />
          <IconMessage />
          <IconTool />
          <SettingPanel>
            <IconSettings />
          </SettingPanel>
        </Space>
      </div>
    </aside>
  );
};

export default Sider;
