import { useEffect } from 'react';
import { Splitter } from 'antd';

import Header from '@/renderer/components/Header';
import Sider from '@/renderer/components/Sider';
import StoreSider from '@/renderer/components/StoreSider';
import FileViewTabs from '@/renderer/components/FileViewTabs';
import './index.css';

const App = () => {
  useEffect(() => {
    // setTimeout(() => events.windowRenderReady(), 1000);
  });

  return (
    <div className="container">
      <Header />
      <main className="main">
        <Sider />
        <Splitter style={{ height: '100%' }}>
          <Splitter.Panel defaultSize={240} min={240} max={320}>
            <StoreSider />
          </Splitter.Panel>
          <Splitter.Panel>
            <FileViewTabs />
          </Splitter.Panel>
        </Splitter>
      </main>
    </div>
  );
};

export default App;
