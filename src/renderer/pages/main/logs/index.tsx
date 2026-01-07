import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Space, DatePicker, Select, Button, Pagination, Typography } from 'antd';
import dayjs from 'dayjs';
import { events } from '@/renderer/utils';
import { PageWrapper, List } from '@/renderer/components';
import './index.css';

const Logs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logsLimit, setLogsLimit] = useState<number>(50);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [kind, setKind] = useState<'normal' | 'error'>('normal');
  const [listHeight, setListHeight] = useState<number>(420);
  const containerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async (date?: string, pageSize?: number, currentPage?: number, k?: 'normal' | 'error') => {
    const payload: any = { date };
    // try to be compatible with both old and new backend signatures
    if (typeof currentPage === 'number') payload.page = currentPage;
    if (typeof pageSize === 'number') payload.pageSize = pageSize;
    if (k) payload.kind = k;
    const res: any = await events.getLogs(payload);
    if (Array.isArray(res)) {
      const data = res.slice(Math.max(0, res.length - (pageSize ?? logsLimit)));
      setLogs(data);
      setTotal(res.length);
      setPage(1);
    } else {
      setLogs(res?.lines || []);
      setTotal(res?.total || 0);
      setPage(res?.page || 1);
    }
  };

  useEffect(() => {
    fetchLogs(undefined, logsLimit, 1, kind);
  }, [logsLimit, kind]);
  useLayoutEffect(() => {
    const recalc = () => {
      const ch = containerRef.current?.clientHeight || 0;
      const fh = footerRef.current?.offsetHeight || 0;
      const gap = 12;
      const next = Math.max(100, ch - fh - gap);
      setListHeight(next);
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', recalc);
    return () => {
      window.removeEventListener('resize', recalc);
      ro.disconnect();
    };
  }, []);

  return (
    <PageWrapper
      title="操作日志"
      actions={
        <Space size={8}>
          <DatePicker
            value={selectedDate ? dayjs(selectedDate) : undefined}
            onChange={(_v: any, dateString: any) => {
              const d = typeof dateString === 'string' ? dateString : null;
              setSelectedDate(d);
              fetchLogs(d || undefined, logsLimit, 1, kind);
            }}
          />
          <Select
            style={{ width: 120 }}
            value={kind}
            onChange={(val: 'normal' | 'error') => {
              setKind(val);
              fetchLogs(selectedDate || undefined, logsLimit, 1, val);
            }}
            options={[
              { label: '普通日志', value: 'normal' },
              { label: '错误日志', value: 'error' },
            ]}
          />
          <Select
            style={{ width: 120 }}
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
          <Button onClick={() => fetchLogs(selectedDate || undefined, logsLimit, 1, kind)}>刷新</Button>
        </Space>
      }
    >
      <div ref={containerRef} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List
        size="small"
        bordered
        height={listHeight}
        itemHeight={28}
        overscan={10}
        className="log-list"
        dataSource={logs}
        renderItem={(line: string, index: number) => {
          const isError = /error/i.test(line);
          const isWarn = !isError && /warn/i.test(line);
          const color = isError ? '#ff4d4f' : isWarn ? '#fa8c16' : 'inherit';
          return (
            <List.Item key={index}>
              <Typography.Text style={{ color }}>{line}</Typography.Text>
            </List.Item>
          );
        }}
      />
      <div ref={footerRef} style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          size="small"
          current={page}
          total={total}
          pageSize={logsLimit}
          showSizeChanger={false}
          onChange={(p) => {
            setPage(p);
            fetchLogs(selectedDate || undefined, logsLimit, p, kind);
          }}
        />
      </div>
      </div>
    </PageWrapper>
  );
};

export default Logs;
