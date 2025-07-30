import React from 'react';
import ReactDOM from 'react-dom/client';

import '@/renderer/styles/index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <div>launch</div>
    </React.StrictMode>,
  );
}
