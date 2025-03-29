import { useEffect } from 'react';
import { Layout } from '@arco-design/web-react';

import Header from '@/renderer/components/Header';

import './index.css';

const App = () => {
  useEffect(() => {}, []);

  return (
    <Layout style={{ width: '100vw', height: '100vh' }}>
      <Layout.Header>
        <Header />
      </Layout.Header>
      <Layout.Content>文件预览</Layout.Content>
    </Layout>
  );
};

export default App;
