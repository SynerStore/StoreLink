import { StoreIcon } from '@/renderer/components';
import { StoreBrandsLabelMap } from '@/constants';
import { StoreBrands } from '@/types';

export type MenuTitleProps = {
  brand: StoreBrands;
};
const MenuTitle = (props: MenuTitleProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <StoreIcon brand={props.brand} size={18} styles={{ marginRight: '8px' }} />
      <span style={{ fontWeight: 500, fontSize: 14 }}> {StoreBrandsLabelMap[props.brand]}</span>
    </div>
  );
};

export default MenuTitle;
