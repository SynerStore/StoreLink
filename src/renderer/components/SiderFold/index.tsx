import { Tooltip } from 'antd';
import { t } from 'i18next';
import { IconFont } from '@/renderer/components';
import { useWindowStore } from '@/renderer/store';

const SiderFold = () => {
  const { storeSiderfold, toggleStoreSiderfold } = useWindowStore();

  return (
    <div
      className="sider-fold"
      style={{
        transform: !storeSiderfold ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <Tooltip title={t('sider.collapse')} placement="bottom">
        <IconFont style={{ transform: 'rotate(180deg)' }} size={18} type="siderbar" onClick={toggleStoreSiderfold} />
      </Tooltip>
    </div>
  );
};

export default SiderFold;
