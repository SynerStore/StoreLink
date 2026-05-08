import React from 'react';
import { Skeleton } from 'antd';
import './index.css';

export type SkeletonType = 'fileCard' | 'fileTable' | 'taskCard' | 'connectionList';

export interface SkeletonLoaderProps {
  type: SkeletonType;
  count?: number;
  loading?: boolean;
  children?: React.ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  count = 8,
  loading = true,
  children,
}) => {
  if (!loading && children) {
    return <>{children}</>;
  }

  const renderSkeleton = () => {
    switch (type) {
      case 'fileCard':
        return (
          <div className="skeleton-file-cards">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="skeleton-file-card">
                <div className="skeleton-file-card-icon">
                  <Skeleton.Node active style={{ width: 64, height: 64 }} />
                </div>
                <div className="skeleton-file-card-name">
                  <Skeleton.Input active size="small" style={{ width: '100%', height: 16 }} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'fileTable':
        return (
          <div className="skeleton-file-table">
            <div className="skeleton-file-table-header">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton.Input key={i} active size="small" style={{ width: `${100 / 5}%`, height: 20 }} />
              ))}
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="skeleton-file-table-row">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton.Input key={j} active size="small" style={{ width: `${100 / 5}%`, height: 16 }} />
                ))}
              </div>
            ))}
          </div>
        );

      case 'taskCard':
        return (
          <div className="skeleton-task-cards">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="skeleton-task-card">
                <div className="skeleton-task-header">
                  <Skeleton.Node active style={{ width: 24, height: 24 }} />
                  <Skeleton.Input active size="small" style={{ width: 120, height: 16 }} />
                </div>
                <div className="skeleton-task-progress">
                  <Skeleton.Input active style={{ width: '100%', height: 8 }} />
                </div>
                <div className="skeleton-task-footer">
                  <Skeleton.Input active size="small" style={{ width: 80, height: 14 }} />
                  <Skeleton.Node active style={{ width: 60, height: 24 }} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'connectionList':
        return (
          <div className="skeleton-connection-list">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="skeleton-connection-item">
                <Skeleton.Node active style={{ width: 20, height: 20 }} />
                <Skeleton.Input active size="small" style={{ flex: 1, height: 16 }} />
              </div>
            ))}
          </div>
        );

      default:
        return <Skeleton active />;
    }
  };

  return <div className="skeleton-loader">{renderSkeleton()}</div>;
};

export default SkeletonLoader;
