import { useState, useEffect, useCallback } from 'react';
import { ipcRenderer } from 'electron';
import { EChannels, ETaskStatus, ETaskType } from '@/types';
import { taskRequest } from '@/renderer/utils';

export const useTasks = (statusFilters?: ETaskStatus[], typeFilters?: ETaskType[]) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskRequest('list', {});
      let filtered = res;
      if (statusFilters && statusFilters.length > 0) {
        filtered = filtered.filter((t: any) => statusFilters.includes(t.status));
      }
      if (typeFilters && typeFilters.length > 0) {
        filtered = filtered.filter((t: any) => typeFilters.includes(t.type));
      }
      setTasks(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(statusFilters), JSON.stringify(typeFilters)]);

  useEffect(() => {
    fetchTasks();

    const handler = (_event: any, updatedTask: any) => {
      setTasks((prev) => {
        if (updatedTask._deleted) {
          return prev.filter((t) => t.taskId !== updatedTask.taskId);
        }

        const index = prev.findIndex((t) => t.taskId === updatedTask.taskId);
        
        // Check if the updated task still matches the filters
        const matchesStatus = !statusFilters || statusFilters.length === 0 || statusFilters.includes(updatedTask.status);
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
          // Add new if it matches
          return [updatedTask, ...prev];
        }
      });
    };

    ipcRenderer.on(EChannels.taskUpdate, handler);

    return () => {
      ipcRenderer.removeListener(EChannels.taskUpdate, handler);
    };
  }, [fetchTasks]);

  const handlePause = async (taskId: string) => {
    await taskRequest('pause', { taskId });
  };

  const handleResume = async (taskId: string) => {
    await taskRequest('resume', { taskId });
  };

  const handleDelete = async (taskId: string) => {
    await taskRequest('delete', { taskId });
  };

  return { tasks, loading, handlePause, handleResume, handleDelete, refresh: fetchTasks };
};
