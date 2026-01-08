import { StoreBrandsLabelMap } from '@/constants';
import { StoreBrands } from '@/types';
import { StoreIcon } from '@/renderer/components';

export type MenuTitleProps = {
  brand: StoreBrands;
  active: boolean;
  onActive: (v: StoreBrands) => void;
};
const StoreBrand = (props: MenuTitleProps) => {
  const { brand, active, onActive } = props;
  return (
    <div onClick={() => onActive(brand)} className={`store-brand ${active ? 'active' : ''}`}>
      <StoreIcon size={26} brand={brand} styles={{ marginRight: '8px' }} />
      <span style={{ fontWeight: 500, fontSize: 16 }}> {StoreBrandsLabelMap[brand as StoreBrands]}</span>
    </div>
  );
};

export default StoreBrand;
