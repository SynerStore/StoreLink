import { useEffect, useMemo } from 'react';
import { Button, Space, Card, Statistic, List, Tag } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { StoreConnectModal, StoreIcon } from '@/renderer/components';
import { useConfigStore } from '@/renderer/store';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus } from '@/types';
import './index.css';
const HomeTab = () => {
  const { connections, initializeData } = useConfigStore();
  const { tasks, refresh } = useTasks();

  const totalConnections = connections.length;
  const runningCount = useMemo(() => {
    return tasks.filter((t: any) =>
      [ETaskStatus.PENDING, ETaskStatus.RUNNING, ETaskStatus.PAUSED].includes(t.status)
    ).length;
  }, [tasks]);

  const todayCompleted = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    const start = new Date(y, m, d).getTime();
    const end = new Date(y, m, d + 1).getTime();
    return tasks.filter((t: any) => {
      if (t.status !== ETaskStatus.COMPLETED) return false;
      if (!t.endTime) return false;
      const ts = new Date(t.endTime).getTime();
      return ts >= start && ts < end;
    }).length;
  }, [tasks]);

  useEffect(() => {
    refresh();
  }, []);

  const favoriteConnections = useMemo(() => {
    return connections.filter((c: any) => c?.isCollected);
  }, [connections]);

  const toggleFavorite = (id: string) => {
    const target = connections.find((c: any) => c.id === id);
    window.electronBridge?.dispatch('eventsX', {
      eventName: 'updateConnectionCollected',
      data: { id, isCollected: !target?.isCollected },
    }).then(async () => {
      await initializeData();
    });
  };

  return (
    <div className="home-tab">
      <div className="home-tab-header">
        <h1>StoreLink</h1>
        <p>让你的存储管理更简单</p>
      </div>
      <div className="home-tab-dashbord">
        <Space size={16} wrap>
          <Card hoverable style={{ width: 220 }}>
            <Statistic title="当前链接数" value={totalConnections} />
          </Card>
          <Card hoverable style={{ width: 220 }}>
            <Statistic title="正在进行的任务" value={runningCount} />
          </Card>
          <Card hoverable style={{ width: 220 }}>
            <Statistic title="今日完成任务" value={todayCompleted} />
          </Card>
        </Space>
      </div>
      <div className="home-tab-content" style={{ marginTop: 16 }}>
        <Space size={12} style={{ width: '100%', justifyContent: 'space-between' }}>
          <StoreConnectModal>
            <Button type="primary" icon={<IconPlus style={{ fontSize: 'medium' }} />}>
              添加连接
            </Button>
          </StoreConnectModal>
        </Space>
        <div style={{ marginTop: 16 }}>
          <Card title="我的收藏链接" bordered={false}>
            {favoriteConnections.length > 0 ? (
              <List
                bordered={false}
                dataSource={favoriteConnections}
                render={(item: any) => (
                  <List.Item key={item.id}>
                    <Space size={8}>
                      <StoreIcon brand={item.brand} size={24} styles={{}} />
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <Tag color="arcoblue">{item.brand}</Tag>
                    </Space>
                    <Button type="text" onClick={() => toggleFavorite(item.id)}>★ 取消收藏</Button>
                  </List.Item>
                )}
              />
            ) : (
              <Space size={8} direction="vertical">
                <span>暂无收藏链接</span>
                <List
                  bordered
                  dataSource={connections}
                  render={(item: any) => (
                    <List.Item key={item.id}>
                      <Space size={8}>
                        <StoreIcon brand={item.brand} size={24} styles={{}} />
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                      </Space>
                      <Button type="text" onClick={() => toggleFavorite(item.id)}>★ 收藏</Button>
                    </List.Item>
                  )}
                />
              </Space>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
