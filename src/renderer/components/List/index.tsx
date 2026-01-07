import React, { useMemo, useRef, useState, useEffect } from 'react';
import './index.css';

type ListProps<T> = {
  dataSource?: T[];
  renderItem?: (item: T, index: number) => React.ReactNode;
  bordered?: boolean;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  height?: number;
  itemHeight?: number;
  overscan?: number;
  emptyText?: React.ReactNode;
};

type ListItemProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const ListItem = (props: ListItemProps) => {
  const { children, className, style } = props;
  return (
    <li className={['list-item', className].filter(Boolean).join(' ')} style={style}>
      {children}
    </li>
  );
};

function BaseList<T = any>(props: ListProps<T>) {
  const {
    dataSource = [],
    renderItem,
    bordered = false,
    size = 'middle',
    className,
    style,
    children,
    height,
    itemHeight,
    overscan = 6,
    emptyText = '暂无数据',
  } = props;
  const classes = ['list', bordered ? 'list-bordered' : '', `list-${size}`, className].filter(Boolean).join(' ');

  const enabled = useMemo(() => !!height && !!itemHeight, [height, itemHeight]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const total = dataSource.length;
  const viewCount = enabled ? Math.ceil((height as number) / (itemHeight as number)) : total;
  const startIndex = enabled ? Math.max(0, Math.floor(scrollTop / (itemHeight as number))) : 0;
  const endIndex = enabled ? Math.min(total, startIndex + viewCount + overscan) : total;
  const offsetY = enabled ? startIndex * (itemHeight as number) : 0;
  const slice = enabled ? dataSource.slice(startIndex, endIndex) : dataSource;

  useEffect(() => {
    setScrollTop(0);
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
  }, [dataSource, height, itemHeight]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  };

  if (!renderItem && !children) {
    return (
      <div className={classes} style={style}>
        <div className="list-empty">{emptyText}</div>
      </div>
    );
  }

  if (enabled) {
    return (
      <div className={classes} style={{ ...style, height, overflow: 'auto' }} onScroll={handleScroll} ref={viewportRef}>
        <div style={{ height: total * (itemHeight as number), position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {slice.map((item, i) => (
              <ListItem key={(item as any)?.id ?? startIndex + i}>{renderItem!(item, startIndex + i)}</ListItem>
            ))}
          </div>
        </div>
        {total === 0 ? <div className="list-empty">{emptyText}</div> : null}
      </div>
    );
  }

  const content =
    renderItem && dataSource
      ? dataSource.map((item, i) => <ListItem key={(item as any)?.id ?? i}>{renderItem(item, i)}</ListItem>)
      : children;

  return (
    <ul className={classes} style={style}>
      {content}
    </ul>
  );
}

const List = BaseList as unknown as {
  <T = any>(props: ListProps<T>): JSX.Element;
  Item: typeof ListItem;
};

List.Item = ListItem;

export default List;
