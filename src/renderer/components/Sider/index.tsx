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
import './index.css';

export type SiderProps = {
  onFold: () => void;
  fold: boolean;
};
const Sider = (props: SiderProps) => {
  const { onFold, fold } = props;

  return (
    <aside className="sider">
      <div className="sider-top">
        {fold ? <IconMenuUnfold onClick={onFold} /> : <IconMenuFold onClick={onFold} />}
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
