import { Button ,Space} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { StoreConnectModal } from '@/renderer/components';

import './index.css';
const HomeTab = () => {
  return (
    <div className="home-tab">
      <div className="home-tab-header">
        <h1>StoreLink</h1>
        <p> 让你的存储管理更简单</p>
      </div>
      <div className="home-tab-dashbord">
 {/* <!-- 概览卡片区 (新增存储空间总数、账号数量卡片) --> */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {/* <!-- 总存储链接数 --> */}
            <div className="bg-white rounded-lg p-5 card-shadow flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className="fa-solid fa-link text-primary text-xl"></i>
                </div>
                <div>
                    <p className="text-neutral-400 text-sm">总存储链接数</p>
                    <h3 className="text-2xl font-bold text-neutral-600">8</h3>
                </div>
            </div>

            {/* <!-- 正在进行的任务 --> */}
            <div className="bg-white rounded-lg p-5 card-shadow flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <i className="fa-solid fa-spinner text-warning text-xl"></i>
                </div>
                <div>
                    <p className="text-neutral-400 text-sm">正在进行的任务</p>
                    <h3 className="text-2xl font-bold text-neutral-600">3</h3>
                </div>
            </div>

            {/* <!-- 已完成任务 --> */}
            <div className="bg-white rounded-lg p-5 card-shadow flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <i className="fa-solid fa-check-circle text-success text-xl"></i>
                </div>
                <div>
                    <p className="text-neutral-400 text-sm">今日已完成任务</p>
                    <h3 className="text-2xl font-bold text-neutral-600">24</h3>
                </div>
            </div>

            {/* <!-- 已用存储容量 --> */}
            <div className="bg-white rounded-lg p-5 card-shadow flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className="fa-solid fa-database text-primary text-xl"></i>
                </div>
                <div>
                    <p className="text-neutral-400 text-sm">已用存储容量</p>
                    <h3 className="text-2xl font-bold text-neutral-600">128.5 GB</h3>
                </div>
            </div>

            {/* <!-- 新增：总存储空间数量 --> */}
            <div className="bg-white rounded-lg p-5 card-shadow flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    <i className="fa-solid fa-boxes-stacked text-neutral-500 text-xl"></i>
                </div>
                <div>
                    <p className="text-neutral-400 text-sm">总存储空间数</p>
                    <h3 className="text-2xl font-bold text-neutral-600">15</h3>
                </div>
            </div>

            {/* <!-- 新增：账号数量 --> */}
            <div className="bg-white rounded-lg p-5 card-shadow flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    <i className="fa-solid fa-user-circle text-neutral-500 text-xl"></i>
                </div>
                <div>
                    <p className="text-neutral-400 text-sm">管理账号数</p>
                    <h3 className="text-2xl font-bold text-neutral-600">6</h3>
                </div>
            </div>
        </section>

      </div>
      展示所有的存储空间数量 展示所有的账号数量 展示管理按钮 账号添加按钮 展示常用的品牌添加快捷键 最近查看 我的收藏
      <div className="home-tab-content">
        <StoreConnectModal>
          <Button type="primary" icon={<IconPlus style={{ fontSize: 'medium' }} />}>
            添加连接
          </Button>
        </StoreConnectModal>
      </div>
    </div>
  );
};

export default HomeTab;
