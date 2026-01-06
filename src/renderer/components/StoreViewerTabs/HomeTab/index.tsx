import { useEffect, useMemo, useState } from 'react';
import { Button, Space, Card, Statistic, List, Tag, DatePicker, Select } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { StoreConnectModal, StoreIcon } from '@/renderer/components';
import { useConfigStore } from '@/renderer/store';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus } from '@/types';
import dayjs from 'dayjs';
import { events } from '@/renderer/utils';
import './index.css';

const HomeTab = () => {
  const { connections, initializeData } = useConfigStore();
  const { tasks, refresh } = useTasks();

  const totalConnections = connections.length;
  const runningCount = useMemo(() => {
    return tasks.filter((t: any) => [ETaskStatus.PENDING, ETaskStatus.RUNNING, ETaskStatus.PAUSED].includes(t.status))
      .length;
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
    window.electronBridge
      ?.dispatch('eventsX', {
        eventName: 'updateConnectionCollected',
        data: { id, isCollected: !target?.isCollected },
      })
      .then(async () => {
        await initializeData();
      });
  };

  const [logs, setLogs] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logsLimit, setLogsLimit] = useState<number>(10);
  const fetchLogs = async (date?: string, limit?: number) => {
    const res = await events.getLogs({ date, limit: limit ?? logsLimit });
    setLogs(res || []);
  };
  useEffect(() => {
    fetchLogs();
  }, [logsLimit]);

  return (
    <div className="home-tab">
      <div className="home-tab-header">
        <h2>StoreLink</h2>
        <StoreConnectModal>
          <Button type="primary" icon={<IconPlus style={{ fontSize: 'medium' }} />}>
            添加连接
          </Button>
        </StoreConnectModal>
      </div>
      <div className="home-tab-dashbord">
        <Card hoverable className="home-tab-dashbord-card">
          <Statistic title="当前链接数" value={totalConnections} />
        </Card>
        <Card hoverable className="home-tab-dashbord-card">
          <Statistic title="正在进行的任务" value={runningCount} />
        </Card>
        <Card hoverable className="home-tab-dashbord-card">
          <Statistic title="今日完成任务" value={todayCompleted} />
        </Card>
      </div>
      <div className="home-tab-content" style={{ marginTop: 16 }}>
        <div style={{ marginTop: 16 }}>
          <Card title="我的收藏链接" bordered={false}>
            {favoriteConnections.length > 0 ? (
              <List
                bordered={false}
                dataSource={favoriteConnections}
                render={(item: any) => (
                  <List.Item key={item.id} style={{ padding: 12, cursor: 'pointer' }}>
                    <Space size={8}>
                      <StoreIcon brand={item.brand} size={24} styles={{}} />
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <Tag color="arcoblue">{item.brand}</Tag>
                    </Space>
                    <Button type="text" onClick={() => toggleFavorite(item.id)}>
                      ★ 取消收藏
                    </Button>
                  </List.Item>
                )}
              />
            ) : (
              <Space size={8} direction="vertical">
                <span>暂无收藏链接</span>
              </Space>
            )}
          </Card>
        </div>
        <div style={{ marginTop: 16 }}>
          <Card
            title="操作日志"
            bordered={false}
            extra={
              <Space size={8}>
                <DatePicker
                  value={selectedDate ? dayjs(selectedDate) : undefined}
                  onChange={(_v: any, dateString: any) => {
                    const d = typeof dateString === 'string' ? dateString : null;
                    setSelectedDate(d);
                    fetchLogs(d || undefined);
                  }}
                />
                <Select
                  style={{ width: 100 }}
                  value={String(logsLimit)}
                  onChange={(val) => {
                    const n = Number(val);
                    setLogsLimit(n);
                  }}
                  options={[
                    { label: '10条', value: '10' },
                    { label: '50条', value: '50' },
                    { label: '100条', value: '100' },
                  ]}
                />
                <Button onClick={() => fetchLogs(selectedDate || undefined)}>刷新</Button>
              </Space>
            }
          >
            <List
              size="small"
              bordered
              dataSource={logs}
              render={(line: string, index: number) => <List.Item key={index}>{line}</List.Item>}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
