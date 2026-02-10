import { useEffect, useMemo, useState } from 'react';
import { Button, Space, Card, Statistic, Tag, DatePicker, Select, Progress, Divider, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { StoreConnectModal, StoreIcon, List, StoreViewerWrap } from '@/renderer/components';
import { useConfigStore, useTabsStore } from '@/renderer/store';
import { useTasks } from '@/renderer/hooks';
import { ETaskStatus } from '@/types';
import dayjs from 'dayjs';
import { events } from '@/renderer/utils';
import './index.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const HomeTab = () => {
  const { connections, initializeData } = useConfigStore();
  const { tasks, refresh } = useTasks();
  const [activeStoreCount, setActiveStoreCount] = useState<number>(0);
  const [workerStats, setWorkerStats] = useState<any>({});
  const { activeTab } = useTabsStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      events.getTaskWorkerStats().then((s: any) => setWorkerStats(s || {}));
    }
  }, [tasks, activeTab]);
  useEffect(() => {
    if (activeTab !== 'home') return;
    events.getActiveStoreCount().then((n: number) => setActiveStoreCount(n || 0));
    events.getTaskWorkerStats().then((s: any) => setWorkerStats(s || {}));
    const timer = setInterval(() => {
      events.getActiveStoreCount().then((n: number) => setActiveStoreCount(n || 0));
      events.getTaskWorkerStats().then((s: any) => setWorkerStats(s || {}));
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
    <StoreViewerWrap
      content={
        <div className="home-tab">
          <div className="home-tab-hero">
            <div className="home-tab-hero-main">
              <div className="home-tab-title">{t('home.title')}</div>
              <div className="home-tab-subtitle">{t('home.subtitle')}</div>
              <Space size={8} className="home-tab-meta">
                <Tag color="blue">{t('home.meta.connections', { count: totalConnections })}</Tag>
                <Tag color="geekblue">{t('home.meta.running', { count: runningCount })}</Tag>
                <Tag color="cyan">{t('home.meta.active', { count: activeStoreCount })}</Tag>
                <Tag color="green">{t('home.meta.completed', { count: todayCompleted })}</Tag>
              </Space>
            </div>
            <div className="home-tab-hero-actions">
              <StoreConnectModal>
                <Button type="primary" icon={<PlusOutlined style={{ fontSize: 'medium' }} />}>
                  {t('storeSider.addConnection')}
                </Button>
              </StoreConnectModal>
              <Button onClick={() => navigate('/tasks')}>{t('home.quick.tasks')}</Button>
              <Button onClick={() => navigate('/logs')}>{t('home.quick.logs')}</Button>
              <Button
                onClick={() => {
                  refresh();
                  fetchLogs(selectedDate || undefined);
                }}
              >
                {t('home.quick.refresh')}
              </Button>
            </div>
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
          <div className="home-tab-dashbord home-tab-dashbord-sub">
            <Card hoverable className="home-tab-dashbord-card">
              <Statistic title={t('home.stats.inFlight')} value={workerStats?.inFlight || 0} />
            </Card>
            <Card hoverable className="home-tab-dashbord-card">
              <Statistic title={t('home.stats.submitted')} value={workerStats?.submitted || 0} />
            </Card>
            <Card hoverable className="home-tab-dashbord-card">
              <Statistic title={t('home.stats.failed')} value={workerStats?.failed || 0} />
            </Card>
            <Card hoverable className="home-tab-dashbord-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('home.stats.successRate')}</div>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>
                    {(() => {
                      const s = workerStats?.submitted || 0;
                      const f = workerStats?.failed || 0;
                      const rate = s > 0 ? Math.round(((s - f) / s) * 100) : 0;
                      return `${rate}%`;
                    })()}
                  </div>
                </div>
                <Tooltip title={t('home.stats.successRateTip')}>
                  <Progress
                    type="circle"
                    size={64}
                    percent={(() => {
                      const s = workerStats?.submitted || 0;
                      const f = workerStats?.failed || 0;
                      return s > 0 ? Math.round(((s - f) / s) * 100) : 0;
                    })()}
                  />
                </Tooltip>
              </div>
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
                <Space size={12} style={{ marginBottom: 8 }}>
                  <Tag color="default">{t('home.worker.statusCount')}</Tag>
                  <Space size={8}>
                    <Tag>{t('tasks.pending')}: {workerStats?.statusCount?.pending || 0}</Tag>
                    <Tag color="blue">{t('tasks.running')}: {workerStats?.statusCount?.running || 0}</Tag>
                    <Tag color="orange">{t('tasks.paused')}: {workerStats?.statusCount?.paused || 0}</Tag>
                    <Tag color="green">{t('tasks.completed')}: {workerStats?.statusCount?.completed || 0}</Tag>
                    <Tag color="red">{t('tasks.failed')}: {workerStats?.statusCount?.failed || 0}</Tag>
                  </Space>
                </Space>
                <Divider style={{ margin: '8px 0' }} />
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
      }
    />
  );
};

export default HomeTab;
