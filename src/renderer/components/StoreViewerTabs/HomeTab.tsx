import { Button } from '@arco-design/web-react';
import StoreConnectModal from '../StoreConnectModal';

const HomeTab = () => {
  return (
    <div>
      展示所有的存储空间数量 展示所有的账号数量 展示管理按钮 账号添加按钮 展示常用的品牌添加快捷键
      <div>
        <StoreConnectModal>
          <Button type="primary"> 添加连接</Button>
        </StoreConnectModal>
      </div>
    </div>
  );
};

export default HomeTab;
