import { useEffect, useState } from 'react';

import { StoreViewerTabs, Header, Sider, StoreSider } from '@/renderer/components';
import { useConfigStore, useTabsStore } from '@/renderer/store';
import { updateRootStyleProperty } from '@/renderer/utils';
import './index.css';

const App = () => {
  const configStore = useConfigStore();
  const tabsStore = useTabsStore();
  const [storeSiderfold, setStoreSiderfold] = useState(false);
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
    // setTimeout(() => events.windowRenderReady(), 1000);
    handleOnready();
  }, []);

  return (
    <div className="container">
      <Header />
      <main className="main">
        <Sider fold={storeSiderfold} onFold={handleFold} />
        <StoreSider fold={storeSiderfold} />
        <StoreViewerTabs />
      </main>
    </div>
  );
};

export default App;
