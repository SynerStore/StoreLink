import { useMemo } from 'react';
import { Tabs } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import { useTabsStore } from '@/renderer/store';
import StoreViewer from '../StoreViewer';
import HomeTab from './HomeTab';
const StoreViewerTabs = () => {
  const { tabs, activeTab, removeTab, selectTab }: any = useTabsStore();

  const items = useMemo(() => {
    const allTabs = tabs.map((tab: any) => {
      return {
        label: tab.name,
        key: tab.id,
        children: <StoreViewer data={tab} />,
      };
    });

    allTabs.unshift({
      label: 'Home',
      key: 'home',
      icon: <HomeOutlined />,
      children: <HomeTab />,
    });
    return allTabs;
  }, [tabs]);

  const handleClick = (key: string) => {
    selectTab(key);
  };

  const handleClose = (key: any, action: 'add' | 'remove') => {
    console.log(key, action);
    if (action === 'remove') {
      removeTab(key);
    }
  };

  return (
    <div>
      <Tabs
        size="small"
        type="editable-card"
        hideAdd={true}
        activeKey={activeTab}
        items={items}
        onEdit={handleClose}
        onChange={handleClick}
      />
    </div>
  );
};

export default StoreViewerTabs;
