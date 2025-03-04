import { useState } from 'react';
import { Radio, Tabs } from 'antd';
import type { TabsProps } from 'antd';

const FileViweTabs = () => {
  const [items, setItems] = useState<TabsProps['items']>([
    {
      label: '主页',
      key: '1',
      children: 'Content of editable tab 1',
    },
    {
      label: '阿里云 oss',
      key: '2',
      children: 'Content of editable tab 2',
    },
    {
      label: '腾讯云 cos',
      key: '3',
      children: 'Content of editable tab 3',
    },
  ]);

  return (
    <div>
      <Tabs
        defaultActiveKey="1"
        size="small"
          type="card"
        style={{ marginBottom: 32 }}
        items={Array.from({ length: 3 }).map((_, i) => {
          const id = String(i + 1);
          return {
            label: `Tab ${id}`,
            key: id,
            children: `Content of tab ${id}`,
          };
        })}
      />
    </div>
  );
};

export default FileViweTabs;
