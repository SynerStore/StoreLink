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
};

const StoreViewerWrap = (props: StoreViewerProps) => {
  const { headerViewPath, headerViewActions, content, footer, extra } = props;

  const withHeader = useMemo(() => !!headerViewPath || !!headerViewActions, [headerViewPath, headerViewActions]);

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
