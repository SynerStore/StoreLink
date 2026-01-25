import React, { CSSProperties, forwardRef } from 'react';

export interface IconFontProps extends React.HTMLAttributes<HTMLElement> {
  type: string;
  size?: number | string;
  color?: string;
  pointer?: boolean;
}

const IconFont = forwardRef<HTMLElement, IconFontProps>(({
  type,
  size,
  color,
  pointer = true,
  style,
  className = '',
  ...restProps
}, ref) => {
  const styles: CSSProperties = {
    fontSize: size || 'inherit',
    cursor: pointer ? 'pointer' : 'inherit',
    ...style,
  };

  return <i ref={ref} className={`iconfont icon-${type} ${className}`} style={styles} {...restProps} />;
});

export default IconFont;
