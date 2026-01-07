import React from 'react';
import './index.css';

type PageWrapperProps = {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

const PageWrapper = (props: PageWrapperProps) => {
  const { title, actions, children } = props;
  return (
    <div className="page-wrapper">
      <div className="page-wrapper-header">
        <div className="page-wrapper-title">{title}</div>
        <div className="page-wrapper-actions">{actions}</div>
      </div>
      <div className="page-wrapper-content">{children}</div>
    </div>
  );
};

export default PageWrapper;
