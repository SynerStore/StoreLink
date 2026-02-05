import { useState, useEffect, useCallback } from 'react';
import { EChannels, ETaskStatus, ETaskType } from '@/types';
import { taskRequest } from '@/renderer/utils';

export const useTasks = (statusFilters?: ETaskStatus[], typeFilters?: ETaskType[]) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTasks = useCallback(
    async (page = current, size = pageSize) => {
      setLoading(true);
      try {
        const res = await taskRequest('list', {
          status: statusFilters,
          type: typeFilters,
          current: page,
          pageSize: size,
        });

        if (res && typeof res === 'object' && 'list' in res) {
          setTasks(res.list);
          setTotal(res.total);
          setCurrent(res.current);
          setPageSize(res.pageSize);
        } else {
          // Fallback or empty
          setTasks([]);
          setTotal(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [JSON.stringify(statusFilters), JSON.stringify(typeFilters)],
  );

  useEffect(() => {
    fetchTasks(current, pageSize);

    const handler = (updatedTask: any) => {
      setTasks((prev) => {
        if (updatedTask._deleted) {
          return prev.filter((t) => t.taskId !== updatedTask.taskId);
        }

        const index = prev.findIndex((t) => t.taskId === updatedTask.taskId);

        // Check if the updated task still matches the filters
        const matchesStatus =
          !statusFilters || statusFilters.length === 0 || statusFilters.includes(updatedTask.status);
        const matchesType = !typeFilters || typeFilters.length === 0 || typeFilters.includes(updatedTask.type);

        if (!matchesStatus || !matchesType) {
          // If it no longer matches, remove it
          if (index !== -1) {
            const newTasks = [...prev];
            newTasks.splice(index, 1);
            return newTasks;
          }
          return prev;
        }

        if (index !== -1) {
          // Update existing
          const newTasks = [...prev];
          newTasks[index] = { ...newTasks[index], ...updatedTask };
          return newTasks;
        } else {
          // Add new if it matches and we are on the first page
          if (current === 1) {
            const newTasks = [updatedTask, ...prev];
            // Optionally enforce pageSize limit locally or wait for refresh
            return newTasks;
          }
          return prev;
        }
      });
    };

    window.electronBridge?.on(EChannels.taskUpdate, handler);

    return () => {
      window.electronBridge?.removeListener(EChannels.taskUpdate, handler);
    };
  }, [fetchTasks, current, pageSize]);

  const handlePause = async (taskId: string) => {
    await taskRequest('pause', { taskId });
  };

  const handleResume = async (taskId: string) => {
    await taskRequest('resume', { taskId });
  };

  const handleDelete = async (taskId: string) => {
    await taskRequest('delete', { taskId });
    // Refetch to update pagination
    fetchTasks(current, pageSize);
  };

  const handleTableChange = (pagination: any) => {
    const { current: newCurrent, pageSize: newPageSize } = pagination;
    setCurrent(newCurrent);
    setPageSize(newPageSize);
    // fetchTasks will be triggered by useEffect
  };

  return {
    tasks,
    loading,
    handlePause,
    handleResume,
    handleDelete,
    refresh: () => fetchTasks(current, pageSize),
    pagination: {
      current,
      pageSize,
      total,
      onChange: (page: number, size: number) => {
        setCurrent(page);
        setPageSize(size);
      },
    },
    handleTableChange,
  };
};
