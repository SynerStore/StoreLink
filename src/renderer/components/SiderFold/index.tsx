import { Tooltip } from 'antd';

import { t } from 'i18next';

import { MenuUnfoldOutlined } from '@ant-design/icons';
import { MenuFoldOutlined } from '@ant-design/icons';
import { useWindowStore } from '@/renderer/store';

const SiderFold = () => {
  const { storeSiderfold, toggleStoreSiderfold } = useWindowStore();

  return (
    <div className="sider-fold">
      {!storeSiderfold ? (
        <Tooltip title={t('sider.expand')} placement="bottom">
          <MenuUnfoldOutlined onClick={toggleStoreSiderfold} />
        </Tooltip>
      ) : (
        <Tooltip title={t('sider.collapse')} placement="bottom">
          <MenuFoldOutlined onClick={toggleStoreSiderfold} />
        </Tooltip>
      )}
    </div>
  );
};

export default SiderFold;
