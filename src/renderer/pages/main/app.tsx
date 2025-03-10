import { useEffect } from 'react';
import { Splitter } from 'antd';

import Header from '@/renderer/components/Header';
import Sider from '@/renderer/components/Sider';
import StoreSider from '@/renderer/components/StoreSider';
import StoreViewerTabs from '@/renderer/components/StoreViewerTabs';
import { useConfigStore } from '@/renderer/store';
import './index.css';

const App = () => {
  const configStore = useConfigStore();

  const handleOnready = () => {
    configStore.initializeData();
  };

  useEffect(() => {
    // setTimeout(() => events.windowRenderReady(), 1000);
    handleOnready();
  }, []);

  return (
    <div className="container">
      <Header />
      <main className="main">
        <Sider />
        <div className="main-content">
          <Splitter style={{ height: '100%' }}>
            <Splitter.Panel defaultSize={240} min={240} max={320}>
              <StoreSider />
            </Splitter.Panel>
            <Splitter.Panel>
              <StoreViewerTabs />
            </Splitter.Panel>
          </Splitter>
        </div>
      </main>
    </div>
  );
};

export default App;
