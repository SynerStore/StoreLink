import { Dropdown, Menu, Space } from '@arco-design/web-react';

export type ContextMenuProps = {
  children: React.ReactNode;
  menu?: {
    icon?: React.ReactNode;
    text?: string;
    onClick?: () => void;
    render?: () => React.ReactNode;
  }[];
};
function ContextMenu(props: ContextMenuProps) {
  const { children, menu = [] } = props;
  return (
    <Dropdown
      trigger="contextMenu"
      position="bl"
      droplist={
        <Menu>
          {menu.map((item, index) => {
            return (
              <Menu.Item key={`${index}`} onClick={item.onClick}>
                {item.render ? (
                  item.render()
                ) : (
                  <Space size={2}>
                    {item.icon} {item.text}
                  </Space>
                )}
              </Menu.Item>
            );
          })}
        </Menu>
      }
    >
      {children}
    </Dropdown>
  );
}

export default ContextMenu;
