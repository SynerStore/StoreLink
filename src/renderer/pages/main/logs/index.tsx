import { useEffect, useState } from 'react';
import { Space, DatePicker, Select, Button, List, Pagination, Typography } from 'antd';
import dayjs from 'dayjs';
import { events } from '@/renderer/utils';
import { PageWrapper } from '@/renderer/components';

const Logs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logsLimit, setLogsLimit] = useState<number>(50);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [kind, setKind] = useState<'normal' | 'error'>('normal');

  const fetchLogs = async (date?: string, pageSize?: number, currentPage?: number, k?: 'normal' | 'error') => {
    const res = await events.getLogs({ date, page: currentPage ?? page, pageSize: pageSize ?? logsLimit, kind: k ?? kind });
    setLogs(res?.lines || []);
    setTotal(res?.total || 0);
    setPage(res?.page || 1);
  };

  useEffect(() => {
    fetchLogs(undefined, logsLimit, 1, kind);
  }, [logsLimit, kind]);

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
      <List
        size="small"
        bordered
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
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
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
    </PageWrapper>
  );
};

export default Logs;
