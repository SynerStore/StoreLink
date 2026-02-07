import React, { useEffect, useMemo } from 'react';
import { ConfigProvider, theme, Modal, App as AntdApp } from 'antd';
import { HashRouter, Route, Routes } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import 'antd/dist/reset.css';

import '@/renderer/i18n';
import { Header, Sider, ErrorModal, ErrorBoundary, GlobalAntd } from '@/renderer/components';
import { useConfigStore, useTabsStore, useSettingStore, EnumTheme, useWindowStore } from '@/renderer/store';
import { useTaskNotification } from '@/renderer/hooks';
import { updateRootStyleProperty, isInMac, isInWin } from '@/renderer/utils';
import '@/renderer/styles/index.css';

import Tasks from './tasks';
import Logs from './logs';
import Setting from './setting';
import Home from './home';
import './index.css';

// 弹出窗居中
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
  const windowStore = useWindowStore();
  useTaskNotification();

  const locale = useMemo(() => {
    return settingStore.settings.lang === 'zh-CN' ? zhCN : enUS;
  }, [settingStore]);

  const antdTheme = useMemo(() => {
    return {
      algorithm: settingStore.settings.theme === EnumTheme.DARK ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: '#4856b3',
      },
    };
  }, [settingStore.settings.theme]);

  useEffect(() => {
    if (settingStore.settings.theme === EnumTheme.DARK) {
      document.body.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }, [settingStore.settings.theme]);

  const handleOnready = () => {
    settingStore.initializeData();
    configStore.initializeData();
    tabsStore.initializeData();
  };

  useEffect(() => {
    updateRootStyleProperty('--store-sider-width', windowStore.storeSiderfold ? '0px' : '230px');
  }, [windowStore.storeSiderfold]);

  useEffect(() => {
    __patchModalCentered__();
    // setTimeout(() => events.windowRenderReady(), 1000);
    handleOnready();

    if (isInMac()) {
      document.body.classList.add('macos');
      document.body.classList.remove('windows');
    } else if (isInWin()) {
      document.body.classList.add('windows');
      document.body.classList.remove('macos');
    }
  }, []);

  return (
    <React.StrictMode>
      <ConfigProvider locale={locale} theme={antdTheme}>
        <AntdApp>
          <GlobalAntd />
          <ErrorBoundary>
            <HashRouter>
              <div className="container">
                <Header />
                <main className="main">
                  <Sider />
                  <div className="content">
                    <Routes>
                      <Route path="/" element={<Home fold={windowStore.storeSiderfold} />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/logs" element={<Logs />} />
                      <Route path="/setting" element={<Setting />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </HashRouter>
            <ErrorModal />
          </ErrorBoundary>
        </AntdApp>
      </ConfigProvider>
    </React.StrictMode>
  );
};

export default App;
