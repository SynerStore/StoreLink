import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { EChannels, ETaskStatus } from '@/types';
import { useSettingStore } from '@/renderer/store';

export const useTaskNotification = () => {
  const { t } = useTranslation();
  const settingStore = useSettingStore();
  // throttle notification to avoid spam
  const lastNotificationTime = useRef<number>(0);

  useEffect(() => {
    const handler = (data: any) => {
      const updates = Array.isArray(data) ? data : [data];

      updates.forEach((updatedTask) => {
        if (updatedTask.status === ETaskStatus.COMPLETED) {
          if (!settingStore.settings.systemNotification) return;

          const now = Date.now();
          // Simple throttle: max 1 notification per 2 seconds
          if (now - lastNotificationTime.current < 2000) {
            return;
          }

          // Check if we have permission
          if (Notification.permission === 'granted') {
            new Notification(t('tasks.taskFinished'), {
              body: t('tasks.taskFinishedDesc', {
                name: updatedTask.params?.localPath || updatedTask.params?.key || updatedTask.taskId,
              }),
            });
            lastNotificationTime.current = now;
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                new Notification(t('tasks.taskFinished'), {
                  body: t('tasks.taskFinishedDesc', {
                    name: updatedTask.params?.localPath || updatedTask.params?.key || updatedTask.taskId,
                  }),
                });
                lastNotificationTime.current = now;
              }
            });
          }
        }
      });
    };

    window.electronBridge?.on(EChannels.taskUpdate, handler);

    return () => {
      window.electronBridge?.removeListener(EChannels.taskUpdate, handler);
    };
  }, [t]);
};
