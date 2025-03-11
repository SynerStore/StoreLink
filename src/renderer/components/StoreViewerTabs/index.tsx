import { useMemo } from 'react';
import { Tabs } from '@arco-design/web-react';

import { useTabsStore } from '@/renderer/store';
import StoreViewer from '../StoreViewer';
import HomeTab from './HomeTab';

const TabPane = Tabs.TabPane;

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

    // allTabs.unshift({
    //   label: 'Home',
    //   key: 'home',
    //   icon: <HomeOutlined />,
    //   children: <HomeTab />,
    // });
    return allTabs;
  }, [tabs]);

  const handleClick = (key: string) => {
    selectTab(key);
  };

  const handleClose = (key: any) => {
    console.log(key);
    removeTab(key);
  };

  return (
    <div>
      <Tabs size="small" type="card-gutter" activeTab={activeTab} onDeleteTab={handleClose} onChange={handleClick}>
        <TabPane key={'home'} title={'Home'}>
          <HomeTab />
        </TabPane>
        {items.map((tab: any) => (
          <TabPane key={tab.key} title={tab.label}>
            {tab.children}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default StoreViewerTabs;
