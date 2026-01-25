import React, { useMemo } from 'react';
import classNames from 'classnames';
import { SiderFold } from '@/renderer/components';
import './index.css';

export type StoreViewerProps = {
  headerViewPath?: React.ReactNode;
  headerViewActions?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  extra?: React.ReactNode;
  onContentClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

const StoreViewerWrap = (props: StoreViewerProps) => {
  const { headerViewPath, headerViewActions, content, footer, extra, onContentClick } = props;

  const withHeader = useMemo(() => !!headerViewPath || !!headerViewActions, [headerViewPath, headerViewActions]);

const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
  e.stopPropagation();
  onContentClick?.(e);
};


  return (
    <div className="viewer-wrap">
      {withHeader ? (
        <div className="viewer-header">
          {headerViewPath && <div className="viewer-path">{headerViewPath}</div>}
          {headerViewActions && <div className="viewer-actions">{headerViewActions}</div>}
        </div>
      ) : null}
      <div
        className={classNames('viewer-content', {
          'width-header': withHeader,
          'widthout-header': !withHeader,
        })}
        onClick={handleContentClick}
      >
        {content}
      </div>
      <div className="viewer-footer">
        <SiderFold />
        {footer}
      </div>
      {extra}
    </div>
  );
};

export default StoreViewerWrap;
