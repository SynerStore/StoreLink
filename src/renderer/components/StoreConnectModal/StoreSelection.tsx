import { Grid } from '@arco-design/web-react';

import { StoreDatas } from '@/constants';
import StoreBrand from './StoreBrand';

const Row = Grid.Row;
const Col = Grid.Col;

export type StoreSelectionProps = {
  activeBrand: string;
  onActive: (v: string) => void;
};
const StoreSelection = (props: StoreSelectionProps) => {
  const { activeBrand, onActive } = props;
  return (
    <div className="store-selection">
      <Row className="grid-gutter-demo" gutter={[24, 12]}>
        {StoreDatas.map((item, index) => {
          return (
            <Col span={8} key={index}>
              <StoreBrand onActive={onActive} brand={item.brand} active={item.brand === activeBrand} />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default StoreSelection;
