import React from 'react';
import { SiderFold } from '@/renderer/components';
import './index.css';

export type StoreViewerProps = {
  headerViewPath: React.ReactNode;
  headerViewActions: React.ReactNode;
  content: React.ReactNode;
  footer: React.ReactNode;
  extra?: React.ReactNode;
};

const StoreViewerWrap = (props: StoreViewerProps) => {
  const { headerViewPath, headerViewActions, content, footer, extra } = props;

  return (
    <div className="viewer-wrap">
      <div className="viewer-header">
        <div className="viewer-path">{headerViewPath}</div>
        <div className="viewer-actions">{headerViewActions}</div>
      </div>
      <div className="viewer-content">{content}</div>
      <div className="viewer-footer">
        <SiderFold />
        {footer}
      </div>
      {extra}
    </div>
  );
};

export default StoreViewerWrap;
