import React, { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { HashRouter, Route, Routes } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import 'antd/dist/reset.css';

import '@/renderer/i18n';
import { StoreViewerTabs, Header, Sider, StoreSider } from '@/renderer/components';
import { useConfigStore, useTabsStore, useSettingStore, EnumTheme } from '@/renderer/store';
import { updateRootStyleProperty } from '@/renderer/utils';
import '@/renderer/styles/index.css';
import Tasks from './tasks';
import './index.css';

const App = () => {
  const settingStore = useSettingStore();
  const configStore = useConfigStore();
  const tabsStore = useTabsStore();
  const [storeSiderfold, setStoreSiderfold] = useState(false);

  const locale = useMemo(() => {
    return settingStore.settings.lang === 'zh-CN' ? zhCN : enUS;
  }, [settingStore]);

  const antdTheme = useMemo(() => {
    return {
      algorithm: settingStore.settings.theme === EnumTheme.DARK ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: '#3c62cd',
      },
    };
  }, [settingStore.settings.theme]);

  useEffect(() => {
    if (settingStore.settings.theme === EnumTheme.DARK) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [settingStore.settings.theme]);

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
      <ConfigProvider locale={locale} theme={antdTheme}>
        <HashRouter>
          <div className="container">
            <Header />
            <main className="main">
              <Sider fold={storeSiderfold} onFold={handleFold} />
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <StoreSider fold={storeSiderfold} />
                      <StoreViewerTabs />
                    </>
                  }
                />
                <Route path="/tasks" element={<Tasks />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </ConfigProvider>
    </React.StrictMode>
  );
};

export default App;
