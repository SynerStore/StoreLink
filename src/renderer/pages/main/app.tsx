import { useEffect } from 'react';
import { Layout } from '@arco-design/web-react';

import Header from '@/renderer/components/Header';
import Sider from '@/renderer/components/Sider';
import StoreSider from '@/renderer/components/StoreSider';
import StoreViewerTabs from '@/renderer/components/StoreViewerTabs';
import { useConfigStore } from '@/renderer/store';
import './index.css';

// const Sider = Layout.Sider;
// const Header = Layout.Header;
// const Content = Layout.Content;

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
    <Layout style={{ width: '100vw', height: '100vh' }}>
      <Layout.Header>
        <Header />
      </Layout.Header>
      <Layout>
        <Layout.Sider style={{ width: '53px' }}>
          <Sider />
        </Layout.Sider>
        <Layout.Sider style={{ minWidth: 240, maxWidth: 300 }} resizeDirections={['right']}>
          <StoreSider />
        </Layout.Sider>
        <Layout.Content>
          <StoreViewerTabs />
        </Layout.Content>
      </Layout>
    </Layout>
    // <div className="container">
    //   <Header />
    //   <main className="main">
    //     <Sider />
    //     <div className="main-content">
    //       <ResizeBox.Split
    //         direction="horizontal"
    //         style={{
    //           // height: 300,
    //           // width: 300,
    //           // border: '1px solid var(--color-border)',
    //         }}
    //         trigger={null}
    //         size={"240px"}
    //         max={"280px"}
    //         min={"240px"}
    //         panes={[<StoreSider />, <StoreViewerTabs />]}
    //       />
    //       {/* <div style={{ width: 200 }}>
    //         <StoreSider />
    //       </div>

    //       <StoreViewerTabs /> */}
    //     </div>
    //   </main>
    // </div>
  );
};

export default App;
