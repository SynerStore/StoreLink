import { Fragment, useState } from 'react';
import { Modal, Card, Space, Avatar, Typography, Grid } from '@arco-design/web-react';

export type StoreConnectModalProps = {
  children?: React.ReactNode;
  onAddConnection?: (v: any) => void;
};

const { Row, Col } = Grid;

const StoreConnectModal = (props: StoreConnectModalProps) => {
  const { children, onAddConnection } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Fragment>
      <Modal
        title="添加连接"
        closable={false}
        maskClosable={false}
        visible={isModalOpen}
        style={{ width: 720 }}
        onCancel={() => setIsModalOpen(false)}
      >
        <div>
          <Row gutter={20} style={{ marginBottom: 20 }}>
            <Col span={12}>
              <Card hoverable>
                <Space>
                  <Avatar
                    style={{
                      backgroundColor: '#165DFF',
                    }}
                    size={28}
                  >
                    阿
                  </Avatar>
                  <Typography.Text>阿里云 OSS</Typography.Text>
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card hoverable>
                <Space>
                  <Avatar
                    style={{
                      backgroundColor: '#165DFF',
                    }}
                    size={28}
                  >
                    腾
                  </Avatar>
                  <Typography.Text>腾讯云 OSS</Typography.Text>
                </Space>
              </Card>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12}>
              <Card hoverable>
                <Space>
                  <Avatar
                    style={{
                      backgroundColor: '#165DFF',
                    }}
                    size={28}
                  >
                    华
                  </Avatar>
                  <Typography.Text>华为云 OSS</Typography.Text>
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card hoverable>
                <Space>
                  <Avatar
                    style={{
                      backgroundColor: '#165DFF',
                    }}
                    size={28}
                  >
                    ftp
                  </Avatar>
                  <Typography.Text>ftp</Typography.Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
      <span onClick={() => setIsModalOpen(true)}>{children}</span>
    </Fragment>
  );
};

export default StoreConnectModal;
