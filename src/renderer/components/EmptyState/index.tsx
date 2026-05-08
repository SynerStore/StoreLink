import React from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import './index.css';

export type EmptyStateType = 'noConnections' | 'noFiles' | 'noTasks' | 'noSearchResults';

export interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  customTitle?: string;
  customDescription?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction, customTitle, customDescription }) => {
  const { t } = useTranslation();

  const config = {
    noConnections: {
      icon: (
        <div className="empty-state-icon-wrapper">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      ),
      title: customTitle || t('empty.noConnections.title', '暂无存储连接'),
      description: customDescription || t('empty.noConnections.description', '点击右上角 + 按钮添加您的第一个存储服务'),
      actionText: t('empty.noConnections.action', '添加连接'),
      showAction: true,
    },
    noFiles: {
      icon: (
        <div className="empty-state-icon-wrapper">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
        </div>
      ),
      title: customTitle || t('empty.noFiles.title', '文件夹为空'),
      description: customDescription || t('empty.noFiles.description', '拖拽文件到此处上传，或点击上传按钮'),
      actionText: t('empty.noFiles.action', '上传文件'),
      showAction: true,
    },
    noTasks: {
      icon: (
        <div className="empty-state-icon-wrapper success">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      ),
      title: customTitle || t('empty.noTasks.title', '所有任务已完成'),
      description: customDescription || t('empty.noTasks.description', '没有正在进行的传输任务'),
      showAction: false,
    },
    noSearchResults: {
      icon: (
        <div className="empty-state-icon-wrapper">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
      ),
      title: customTitle || t('empty.noSearchResults.title', '未找到匹配项'),
      description: customDescription || t('empty.noSearchResults.description', '尝试使用不同的关键词搜索'),
      showAction: false,
    },
  };

  const { icon, title, description, actionText, showAction } = config[type];

  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {description && <div className="empty-state-description">{description}</div>}
      {showAction && onAction && (
        <div className="empty-state-action">
          <Button type="primary" size="large" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
