import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  virtualizationThreshold?: number;
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
    emptyText,
    virtualizationThreshold = 200,
  } = props;
  const { t } = useTranslation();
  const classes = ['list', bordered ? 'list-bordered' : '', `list-${size}`, className].filter(Boolean).join(' ');
  const emptyTextValue = emptyText ?? t('common.noData');

  const total = dataSource.length;
  const enabled = useMemo(
    () => !!height && !!itemHeight && total > virtualizationThreshold,
    [height, itemHeight, total, virtualizationThreshold],
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const viewCount = enabled ? Math.ceil((height as number) / (itemHeight as number)) : total;
  const startIndex = enabled ? Math.max(0, Math.floor(scrollTop / (itemHeight as number))) : 0;
  const effectiveOverscan = enabled ? Math.max(overscan, Math.ceil(viewCount * 0.5)) : 0;
  const endIndex = enabled ? Math.min(total, startIndex + viewCount + effectiveOverscan) : total;
  const offsetY = enabled ? startIndex * (itemHeight as number) : 0;
  const slice = useMemo(
    () => (enabled ? dataSource.slice(startIndex, endIndex) : dataSource),
    [enabled, dataSource, startIndex, endIndex],
  );

  useEffect(() => {
    setScrollTop(0);
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
  }, [dataSource, height, itemHeight]);

  const rafRef = useRef<number | null>(null);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (rafRef.current != null) return;
    const target = e.target as HTMLDivElement;
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
      rafRef.current = null;
    });
  };

  const isLiElement = (node: React.ReactNode) => {
    if (!React.isValidElement(node)) return false;
    const type = node.type as any;
    return type === 'li' || type === ListItem;
  };

  if (!renderItem && !children) {
    return (
      <div className={classes} style={style}>
        <div className="list-empty">{emptyTextValue}</div>
      </div>
    );
  }

  if (enabled) {
    return (
      <div className={classes} style={{ ...style, height, overflow: 'auto' }} onScroll={handleScroll} ref={viewportRef}>
        <div style={{ height: total * (itemHeight as number), position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {slice.map((item, i) => {
              const index = startIndex + i;
              const node = renderItem!(item, index);
              const key = (item as any)?.id ?? index;
              if (isLiElement(node)) {
                return React.cloneElement(node as React.ReactElement, { key });
              }
              return <ListItem key={key}>{node}</ListItem>;
            })}
          </div>
        </div>
        {total === 0 ? <div className="list-empty">{emptyTextValue}</div> : null}
      </div>
    );
  }

  const content =
    renderItem && dataSource
      ? dataSource.map((item, i) => {
          const node = renderItem(item, i);
          const key = (item as any)?.id ?? i;
          if (isLiElement(node)) {
            return React.cloneElement(node as React.ReactElement, { key });
          }
          return <ListItem key={key}>{node}</ListItem>;
        })
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
