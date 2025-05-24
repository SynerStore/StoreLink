import { StoreIcon } from '@/renderer/components';

export type MenuTitleProps = {
  brand: string;
  children?: React.ReactNode;
};
const MenuTitle = (props: MenuTitleProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <StoreIcon brand={props.brand} size={18} styles={{ marginRight: '8px' }} />
      <span style={{ fontWeight: 500, fontSize: 15 }}> {props.children}</span>
    </div>
  );
};

export default MenuTitle;
