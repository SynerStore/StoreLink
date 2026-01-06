import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from '@arco-design/web-react';

// import App from './app';
import '@arco-design/web-react/dist/css/arco.css';
import '@arco-themes/react-syner-store/css/arco.css';
import '@/renderer/styles/index.css';

// @ts-ignore
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
GlobalWorkerOptions.workerSrc = `./pdf.worker.mjs`;

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ConfigProvider>
        {/* <App /> */}
        sasas
      </ConfigProvider>
    </React.StrictMode>,
  );
}
