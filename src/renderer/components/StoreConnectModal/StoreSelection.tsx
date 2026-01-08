import { Row, Col } from 'antd';

import { StoreDatas } from '@/constants';
import StoreBrand from './StoreBrand';

export type StoreSelectionProps = {
  activeBrand: string;
  onActive: (v: string) => void;
};
const StoreSelection = (props: StoreSelectionProps) => {
  const { activeBrand, onActive } = props;
  return (
    <div className="store-selection">
      <Row className="grid-gutter-demo" gutter={[12, 6]}>
        {StoreDatas.map((item, index) => {
          return (
            <Col span={12} key={index}>
              <StoreBrand onActive={onActive} brand={item.brand} active={item.brand === activeBrand} />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default StoreSelection;
