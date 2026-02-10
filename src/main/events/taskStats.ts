import db from '@/main/db/sqlite';
import TaskScheduler from '@/main/tasks/scheduler';
import { ETaskStatus } from '@/types';

export async function getTaskWorkerStats() {
  const stats = TaskScheduler.getInstance().getStats();
  const counts: Record<string, number> = {};
  const rows = db.prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status').all() as any[];
  rows.forEach((row) => {
    counts[row.status] = row.count;
  });
  const submitted = rows.reduce((sum, row) => sum + (row.count || 0), 0);
  const failed = (counts[ETaskStatus.FAILED] || 0) + (counts[ETaskStatus.CANCELED] || 0);
  const inFlight = (counts[ETaskStatus.RUNNING] || 0) + (counts[ETaskStatus.PAUSED] || 0);
  return {
    ...stats,
    submitted,
    failed,
    inFlight,
    statusCount: counts,
  };
}
