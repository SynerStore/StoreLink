import { useState } from 'react';
import { Space, Divider } from '@arco-design/web-react';
import {
  IconSettings,
  IconMenuFold,
  IconHome,
  IconSwap,
  IconMessage,
  IconTool,
  IconMenuUnfold,
} from '@arco-design/web-react/icon';

import SettingPanel from '../SettingPanel';
import TaskPanel from '../TaskPanel';
import { updateRootStyleProperty } from '@/renderer/utils';
import './index.css';

const Sider = () => {
  const [showSettingPanel, setShowSettingPanel] = useState(false);
  const handleFold = () => {
    setShowSettingPanel(!showSettingPanel);
    const newStoreSiderWidth = showSettingPanel ? '230px' : '0px';
    updateRootStyleProperty('--store-sider-width', newStoreSiderWidth);
  };

  return (
    <aside className="sider">
      <div className="sider-top">
        {showSettingPanel ? <IconMenuUnfold onClick={handleFold} /> : <IconMenuFold onClick={handleFold} />}
        <Divider style={{ margin: '8px 0px' }} />
        <IconHome style={{ color: 'var(--primary-color)' }} />
      </div>
      <div className="sider-bottom">
        <Divider style={{ margin: '8px 0px' }} />
        <Space direction="vertical">
          <TaskPanel>
            <IconSwap />
          </TaskPanel>
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
