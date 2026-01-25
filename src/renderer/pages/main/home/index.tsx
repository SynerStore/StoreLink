import React, { useMemo } from 'react';
import { Splitter } from 'antd';
import { debounce } from 'lodash';

import { StoreViewerTabs, StoreSider } from '@/renderer/components';
import { useSettingStore } from '@/renderer/store';

export type HomeProps = {
  fold: boolean;
};

const Home: React.FC<HomeProps> = ({ fold }) => {
  const { settings, update } = useSettingStore();
  const { siderWidth } = settings;

  const handleResize = (sizes: number[]) => {
    if (sizes.length > 0) {
      update({ siderWidth: sizes[0] });
    }
  };

  const debouncedResize = useMemo(() => debounce(handleResize, 300), []);

  return (
    <Splitter style={{ height: '100%', width: '100%' }} onResize={debouncedResize}>
      {!fold && (
        <Splitter.Panel defaultSize={siderWidth} min={240} max={400}>
          <StoreSider fold={fold} />
        </Splitter.Panel>
      )}
      <Splitter.Panel>
        <StoreViewerTabs />
      </Splitter.Panel>
    </Splitter>
  );
};

export default Home;
