import { Space } from '@arco-design/web-react';
import { IconSettings, IconMenuFold, IconHome, IconSwap, IconMessage, IconTool } from '@arco-design/web-react/icon';

import SettingPanel from '../SettingPanel';

import './index.css';
const Sider = () => {
  return (
    <aside className="sider">
      <div className="sider-top">
        <Space direction="vertical">
          <IconMenuFold />
          <IconHome />
        </Space>
      </div>

      <div className="sider-bottom">
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
