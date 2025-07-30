import React, { useEffect, useMemo, useState } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import '@arco-design/web-react/dist/css/arco.css';
import '@arco-themes/react-syner-store/css/arco.css';

import '@/renderer/i18n';
import { StoreViewerTabs, Header, Sider, StoreSider } from '@/renderer/components';
import { useConfigStore, useTabsStore, useSettingStore } from '@/renderer/store';
import { updateRootStyleProperty } from '@/renderer/utils';
import '@/renderer/styles/index.css';
import './index.css';

const App = () => {
  const settingStore = useSettingStore();
  const configStore = useConfigStore();
  const tabsStore = useTabsStore();
  const [storeSiderfold, setStoreSiderfold] = useState(false);

  const locale = useMemo(() => {
    return settingStore.settings.lang === 'zh-CN' ? zhCN : enUS;
  }, [settingStore]);
  const handleOnready = () => {
    configStore.initializeData();
    tabsStore.initializeData();
  };

  const handleFold = () => {
    setStoreSiderfold(!storeSiderfold);
    const newStoreSiderWidth = storeSiderfold ? '230px' : '0px';
    updateRootStyleProperty('--store-sider-width', newStoreSiderWidth);
  };

  useEffect(() => {
    // setTimeout(() => events.windowRenderReady(), 1000);
    handleOnready();
  }, []);

  return (
    <React.StrictMode>
      <ConfigProvider locale={locale}>
        <div className="container">
          <Header />
          <main className="main">
            <Sider fold={storeSiderfold} onFold={handleFold} />
            <StoreSider fold={storeSiderfold} />
            <StoreViewerTabs />
          </main>
        </div>
      </ConfigProvider>
    </React.StrictMode>
  );
};

export default App;
