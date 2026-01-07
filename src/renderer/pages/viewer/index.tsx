import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import App from './app';
import 'antd/dist/reset.css';
import '@/renderer/styles/index.css';

// @ts-ignore
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
GlobalWorkerOptions.workerSrc = `./pdf.worker.mjs`;

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ConfigProvider locale={zhCN}>
        <App />
      </ConfigProvider>
    </React.StrictMode>,
  );
}
