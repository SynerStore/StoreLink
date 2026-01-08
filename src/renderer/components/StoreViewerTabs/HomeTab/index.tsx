import { useEffect, useMemo, useState } from 'react';
import { Button, Space, Card, Statistic, Tag, DatePicker, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { StoreConnectModal, StoreIcon, List } from '@/renderer/components';
import { useConfigStore, useTabsStore } from '@/renderer/store';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus } from '@/types';
import dayjs from 'dayjs';
import { events } from '@/renderer/utils';
import './index.css';
import { useTranslation } from 'react-i18next';

const HomeTab = () => {
  const { connections, initializeData } = useConfigStore();
  const { tasks, refresh } = useTasks();
  const [activeStoreCount, setActiveStoreCount] = useState<number>(0);
  const { activeTab } = useTabsStore();
  const { t } = useTranslation();

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
  useEffect(() => {
    if (activeTab === 'home') {
      events.getActiveStoreCount().then((n: number) => setActiveStoreCount(n || 0));
    }
  }, [tasks, activeTab]);
  useEffect(() => {
    if (activeTab !== 'home') return;
    events.getActiveStoreCount().then((n: number) => setActiveStoreCount(n || 0));
    const timer = setInterval(() => {
      events.getActiveStoreCount().then((n: number) => setActiveStoreCount(n || 0));
    }, 10000);
    return () => clearInterval(timer);
  }, [activeTab]);

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
    const payload: any = { date, limit: limit ?? logsLimit };
    const res: any = await events.getLogs(payload);
    const lines = Array.isArray(res) ? res : res?.lines || [];
    setLogs(lines);
  };
  useEffect(() => {
    fetchLogs();
  }, [logsLimit]);

  return (
    <div className="home-tab">
      <div className="home-tab-header">
        <h2>{t('home.title')}</h2>
        <StoreConnectModal>
          <Button type="primary" icon={<PlusOutlined style={{ fontSize: 'medium' }} />}>
            {t('storeSider.addConnection')}
          </Button>
        </StoreConnectModal>
      </div>
      <div className="home-tab-dashbord">
        <Card hoverable className="home-tab-dashbord-card">
          <Statistic title={t('home.stats.connections')} value={totalConnections} />
        </Card>
        <Card hoverable className="home-tab-dashbord-card">
          <Statistic title={t('home.stats.running')} value={runningCount} />
        </Card>
        <Card hoverable className="home-tab-dashbord-card">
          <Statistic title={t('home.stats.activeStores')} value={activeStoreCount} />
        </Card>
        <Card hoverable className="home-tab-dashbord-card">
          <Statistic title={t('home.stats.todayCompleted')} value={todayCompleted} />
        </Card>
      </div>
      <div className="home-tab-content" style={{ marginTop: 16 }}>
        <div style={{ marginTop: 16 }}>
          <Card title={t('home.favorites.title')}>
            {favoriteConnections.length > 0 ? (
              <List
                bordered={false}
                dataSource={favoriteConnections}
                renderItem={(item: any) => (
                  <List.Item key={item.id} className="home-tab-content-list-item">
                    <Space size={8}>
                      <StoreIcon brand={item.brand} size={24} styles={{}} />
                      <span className="home-tab-content-list-item-name" style={{ fontWeight: 500 }}>
                        {item.name}
                      </span>
                      <Tag color="blue">{item.brand}</Tag>
                      <Button type="text" onClick={() => toggleFavorite(item.id)}>
                        ★ {t('home.favorites.remove')}
                      </Button>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Space size={8} vertical>
                <span>{t('home.favorites.empty')}</span>
              </Space>
            )}
          </Card>
        </div>
        <div style={{ marginTop: 16 }}>
          <Card
            title={t('home.logs.title')}
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
                    { label: t('home.logs.limit', { count: 10 }), value: '10' },
                    { label: t('home.logs.limit', { count: 50 }), value: '50' },
                    { label: t('home.logs.limit', { count: 100 }), value: '100' },
                  ]}
                />
                <Button onClick={() => fetchLogs(selectedDate || undefined)}>{t('common.refresh')}</Button>
              </Space>
            }
          >
            <List
              size="small"
              bordered
              height={240}
              itemHeight={32}
              dataSource={logs}
              renderItem={(line: string, index: number) => <List.Item key={index}>{line}</List.Item>}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
