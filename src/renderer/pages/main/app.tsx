import React, { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, theme, Modal } from 'antd';
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
import Logs from './logs';
import Setting from './setting';
import './index.css';

const __patchModalCentered__ = (() => {
  let patched = false;
  return () => {
    if (patched) return;
    ['confirm', 'info', 'success', 'warning', 'error'].forEach((k: any) => {
      const orig = (Modal as any)[k];
      (Modal as any)[k] = (config: any) => orig({ centered: true, ...config });
    });
    patched = true;
  };
})();

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
    __patchModalCentered__();
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
              <div className="content">
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
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/setting" element={<Setting />} />
                </Routes>
              </div>
            </main>
          </div>
        </HashRouter>
      </ConfigProvider>
    </React.StrictMode>
  );
};

export default App;
