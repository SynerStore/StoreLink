import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app';
import 'antd/dist/reset.css';
import '@/renderer/styles/index.css';
import '../../i18n';

// @ts-ignore
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
GlobalWorkerOptions.workerSrc = `./pdf.worker.mjs`;

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
