import React, { useMemo, useEffect } from 'react';
import qs from 'query-string';
import { ConfigProvider, theme, Modal } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import 'antd/dist/reset.css';

import { Header, FileViewer, FileIcon } from '@/renderer/components';
import { isInMac, isInWin } from '@/renderer/utils';
import { useSettingStore, EnumTheme } from '@/renderer/store';
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
  const query = qs.parse(window.location.search);
  const settingStore = useSettingStore();

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
    __patchModalCentered__();
    if (settingStore.settings.theme === EnumTheme.DARK) {
      document.body.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
    if (isInMac()) {
      document.body.classList.add('macos');
      document.body.classList.remove('windows');
    } else if (isInWin()) {
      document.body.classList.add('windows');
      document.body.classList.remove('macos');
    }
  }, [settingStore.settings.theme]);

  return (
    <ConfigProvider locale={locale} theme={antdTheme}>
      <div className="container">
        <Header icon={<FileIcon mime={query.mime as string} />} title={query.name as string} />
        <main className="main">
          <FileViewer id={query.id as string} mime={query.mime as string} />
        </main>
      </div>
    </ConfigProvider>
  );
};

export default App;
