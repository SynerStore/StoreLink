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
    <div className="store-viewer-tabs" style={{ display: 'flex', height: '100%' }}>
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

      {/* <div style={{flex:1}}>
        <Tabs
          size="small"
          type="card-gutter"
          editable
          showAddButton={false}
          activeTab={activeTab}
          onDeleteTab={handleClose}
          onChange={handleClick}
        >
          {items.map((tab: any) => (
            <TabPane key={tab.key} title={<div draggable>{tab.label}</div> }>
              {tab.children}
            </TabPane>
          ))}
        </Tabs>
      </div> */}
    </div>
  );
};

export default StoreViewerTabs;
