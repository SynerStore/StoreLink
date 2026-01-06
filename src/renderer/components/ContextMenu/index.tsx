import { Dropdown, Menu, Space } from 'antd';
import './index.css';

export type MenuItem = {
  icon?: React.ReactNode;
  text?: string;
  onClick?: () => void;
  render?: () => React.ReactNode;
};

export type ContextMenuProps = {
  children: React.ReactNode;
  menu?: MenuItem[];
};
function ContextMenu(props: ContextMenuProps) {
  const { children, menu = [] } = props;

  const items = menu.map((item, index) => ({
    key: `${index}`,
    label: item.render ? (
      item.render()
    ) : (
      <Space size={4}>
        {item.icon} {item.text}
      </Space>
    ),
    onClick: item.onClick,
  }));

  return (
    <Dropdown
      menu={{ items }}
      trigger={['contextMenu']}
      placement="bottomLeft"
    >
      {children}
    </Dropdown>
  );
}

export default ContextMenu;
