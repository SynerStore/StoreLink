import StoreIcon from '@/renderer/components/StoreIcon';

export type MenuTitleProps = {
  brand: string;
  children?: React.ReactNode;
};
const MenuTitle = (props: MenuTitleProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <StoreIcon brand={props.brand} styles={{ marginRight: '8px' }} />
      <span style={{ fontWeight: 500 }}> {props.children}</span>
    </div>
  );
};

export default MenuTitle;
