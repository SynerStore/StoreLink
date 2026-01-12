import React, { CSSProperties } from 'react';

export interface IconFontProps extends React.HTMLAttributes<HTMLElement> {
  type: string;
  size?: number | string;
  color?: string;
  pointer?: boolean;
}

const IconFont: React.FC<IconFontProps> = ({
  type,
  size,
  color,
  pointer = true,
  style,
  className = '',
  ...restProps
}) => {
  const styles: CSSProperties = {
    fontSize: size || 'inherit',
    cursor: pointer ? 'pointer' : 'inherit',
    ...style,
  };

  return <i className={`iconfont icon-${type} ${className}`} style={styles} {...restProps} />;
};

export default IconFont;
