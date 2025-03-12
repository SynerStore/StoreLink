import { useMemo } from 'react';
import { Tabs } from '@arco-design/web-react';
import { IconHome } from '@arco-design/web-react/icon';

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
      <Tabs
        size="small"
        type="card-gutter"
        editable
        activeTab={activeTab}
        onDeleteTab={handleClose}
        onChange={handleClick}
      >
        <TabPane
          key={'home'}
          title={
            <span>
              <IconHome style={{ marginRight: 4 }} />
              Home
            </span>
          }
          closable={false}
        >
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
