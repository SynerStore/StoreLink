import { useMemo, useEffect } from 'react';
import { Tabs } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { useTabsStore } from '@/renderer/store';
import { EChannels, ETaskStatus } from '@/types';
import StoreViewer from '../StoreViewer';
import HomeTab from './HomeTab';
import './index.css';

const StoreViewerTabs = () => {
  const { t } = useTranslation();
  const { tabs, activeTab, removeTab, selectTab, updateTab }: any = useTabsStore();

  const items = useMemo(() => {
    const homeTab = {
      label: (
        <span>
          <HomeOutlined style={{ marginRight: 4 }} />
          {t('common.home')}
        </span>
      ),
      key: 'home',
      children: <HomeTab />,
      closable: false,
    };

    const allTabs = tabs.map((tab: any) => {
      return {
        label: tab.name,
        key: tab.id,
        children: <StoreViewer data={tab} />,
      };
    });

    return [homeTab, ...allTabs];
  }, [tabs]);

  useEffect(() => {
    const handler = (updatedTask: any) => {
      if (
        updatedTask?.status === ETaskStatus.COMPLETED &&
        ['delete', 'deleteMulti', 'rename', 'putFolder', 'put', 'copy', 'transfer'].includes(updatedTask?.method) &&
        updatedTask?.connectionId
      ) {
        // Only refresh if the task connection matches the active tab
        if (activeTab === updatedTask.connectionId) {
          updateTab({ id: updatedTask.connectionId, refreshTick: Date.now() });
        }
      }
    };
    window.electronBridge?.on(EChannels.taskUpdate, handler);
    return () => {
      window.electronBridge?.removeListener(EChannels.taskUpdate, handler);
    };
  }, [activeTab]);

  const handleClick = (key: string) => {
    selectTab(key);
  };

  const handleEdit = (targetKey: any, action: 'add' | 'remove') => {
    if (action === 'remove') {
      removeTab(targetKey);
    }
  };

  return (
    <div className="store-viewer-tabs">
      <Tabs
        size="small"
        type="editable-card"
        className="store-viewer-tab store-viewer-tab-left "
        hideAdd
        activeKey={activeTab}
        onEdit={handleEdit}
        onChange={handleClick}
        items={items}
      />
    </div>
  );
};

export default StoreViewerTabs;
