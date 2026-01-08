import React from 'react';
import { StoreViewerTabs, StoreSider } from '@/renderer/components';

export type HomeProps = {
  fold: boolean;
};

const Home: React.FC<HomeProps> = ({ fold }) => {
  return (
    <>
      <StoreSider fold={fold} />
      <StoreViewerTabs />
    </>
  );
};

export default Home;

