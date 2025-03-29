import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import StoreConnectModal from '@/renderer/components/StoreConnectModal';

const HomeTab = () => {
  return (
    <div className="home-tab">
      展示所有的存储空间数量 展示所有的账号数量 展示管理按钮 账号添加按钮 展示常用的品牌添加快捷键 最近查看 我的收藏
      <div>
        <StoreConnectModal>
          <Button type="primary" icon={<IconPlus  style={{fontSize:"medium"}} />}>
            添加连接
          </Button>
        </StoreConnectModal>
      </div>
    </div>
  );
};

export default HomeTab;
