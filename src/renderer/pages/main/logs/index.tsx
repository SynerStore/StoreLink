import { useEffect, useState } from 'react';
import { Space, DatePicker, Select, Button, List } from 'antd';
import dayjs from 'dayjs';
import { events } from '@/renderer/utils';

const Logs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logsLimit, setLogsLimit] = useState<number>(50);

  const fetchLogs = async (date?: string, limit?: number) => {
    const res = await events.getLogs({ date, limit: limit ?? logsLimit });
    setLogs(res || []);
  };

  useEffect(() => {
    fetchLogs();
  }, [logsLimit]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
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
          <Button onClick={() => fetchLogs(selectedDate || undefined)}>刷新</Button>
        </Space>
      </div>
      <List
        size="small"
        bordered
        dataSource={logs}
        renderItem={(line: string, index: number) => <List.Item key={index}>{line}</List.Item>}
      />
    </div>
  );
};

export default Logs;
