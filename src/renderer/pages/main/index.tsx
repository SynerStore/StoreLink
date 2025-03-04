import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';

import App from './app';
import '../../styles/index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ConfigProvider
        prefixCls="store"
        theme={{
          token: { colorPrimary: '#3c62cd', borderRadius: 2 },
          components: {
            Tabs: {},
          },
        }}
      >
        <App />
      </ConfigProvider>
    </React.StrictMode>,
  );
}
