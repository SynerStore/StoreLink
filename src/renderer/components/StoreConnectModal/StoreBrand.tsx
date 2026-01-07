import {StoreIcon} from '@/renderer/components';

export type MenuTitleProps = {
  brand: string;
  active: boolean;
  onActive: (v: string) => void;
};
const StoreBrand = (props: MenuTitleProps) => {
  const { brand, active, onActive } = props;
  return (
    <div
      onClick={() => onActive(brand)}
      className="store-brand"
      style={{
        backgroundColor: active ? '#f5f5f5' : 'transparent',
      }}
    >
      <StoreIcon size={26} brand={brand} styles={{ marginRight: '8px' }} />
      <span style={{ fontWeight: 500,fontSize:16 }}> {brand}</span>
    </div>
  );
};

export default StoreBrand;
