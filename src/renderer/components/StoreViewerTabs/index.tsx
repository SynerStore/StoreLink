import { useMemo, useEffect } from 'react';
import { Tabs } from '@arco-design/web-react';
import { IconHome } from '@arco-design/web-react/icon';

// import { IconSplitColumn } from '@/renderer/components/Icons';
import { useTabsStore } from '@/renderer/store';
import { EChannels, ETaskStatus } from '@/types';
import StoreViewer from '../StoreViewer';
import HomeTab from './HomeTab';
import './index.css';

const TabPane = Tabs.TabPane;

const StoreViewerTabs = () => {
  const { tabs, activeTab, removeTab, selectTab, updateTab }: any = useTabsStore();

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

  useEffect(() => {
    const handler = (updatedTask: any) => {
      if (
        updatedTask?.status === ETaskStatus.COMPLETED &&
        ['delete', 'rename'].includes(updatedTask?.method) &&
        updatedTask?.connectionId
      ) {
        updateTab({ id: updatedTask.connectionId, refreshTick: Date.now() });
      }
    };
    window.electronBridge?.on(EChannels.taskUpdate, handler);
    return () => {
      window.electronBridge?.removeListener(EChannels.taskUpdate, handler);
    };
  }, []);

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
        className="store-viewer-tab store-viewer-tab-left "
        editable
        justify
        showAddButton={false}
        // extra={<IconSplitColumn className="store-viewer-split-icon" size={20} />}
        activeTab={activeTab}
        onDeleteTab={handleClose}
        onChange={handleClick}
        // style={{ width: '50%' }}
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
      {/* <Tabs
        size="small"
        type="card-gutter"
        editable
        justify
        className="store-viewer-tab store-viewer-tab-right "
        showAddButton={false}
        extra={<IconSplitColumn className="store-viewer-split-icon" />}
        activeTab={activeTab}
        onDeleteTab={handleClose}
        onChange={handleClick}
        style={{ width: '50%' }}
      >
        {items.map((tab: any) => (
          <TabPane key={tab.key} title={tab.label}>
            {tab.children}
          </TabPane>
        ))}
      </Tabs> */}
    </div>
  );
};

export default StoreViewerTabs;
