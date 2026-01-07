import React from 'react';
import './index.css';

type ButtonGroupProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const ButtonGroup = (props: ButtonGroupProps) => {
  const { children, className, style } = props;
  return (
    <div className={['button-group', className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  );
};

export default ButtonGroup;
