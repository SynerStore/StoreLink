import { useMemo } from 'react';
import { Tabs } from '@arco-design/web-react';
import { IconHome } from '@arco-design/web-react/icon';

import { useTabsStore } from '@/renderer/store';
import StoreViewer from '../StoreViewer';
import HomeTab from './HomeTab';
import './index.css';

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
    removeTab(key);
  };

  return (
    <div className="store-viewer-tabs">
      <Tabs
        size="small"
        type="card-gutter"
        editable
        justify
        showAddButton={false}
        activeTab={activeTab}
        onDeleteTab={handleClose}
        onChange={handleClick}
        style={{ width: '100%' }}
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
