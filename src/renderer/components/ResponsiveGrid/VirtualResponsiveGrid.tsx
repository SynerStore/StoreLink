import React, { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import List, { ListRef } from 'rc-virtual-list';
import { debounce } from 'lodash-es';
import { useWindowStore } from '../../store/useWindowStore';

export interface VirtualResponsiveGridRef {
  scrollToItem: (index: number) => void;
}

interface VirtualResponsiveGridProps<T> {
  dataSource: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  minItemWidth?: number;
  maxItemWidth?: number;
  rowGap?: number;
  columnGap?: number;
  className?: string;
  padding?: number;
  height?: number;
  onItemsPerRowChange?: (itemsPerRow: number) => void;
}

const VirtualResponsiveGrid = forwardRef<VirtualResponsiveGridRef, VirtualResponsiveGridProps<any>>((props, ref) => {
  const {
    dataSource,
    renderItem,
    minItemWidth = 60,
    maxItemWidth = 100,
    rowGap = 16,
    columnGap = 16,
    className = '',
    padding = 0,
    height = 500,
    onItemsPerRowChange,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ListRef>(null);
  const responsiveGridCardWidth = useWindowStore((state) => state.responsiveGridCardWidth);
  const setResponsiveGridCardWidth = useWindowStore((state) => state.setResponsiveGridCardWidth);
  const responsiveGridCardWidthRef = useRef(responsiveGridCardWidth);
  responsiveGridCardWidthRef.current = responsiveGridCardWidth;

  const [itemWidth, setItemWidth] = useState<number>(responsiveGridCardWidth ?? maxItemWidth);
  const [itemsPerRow, setItemsPerRow] = useState<number>(1);

  useImperativeHandle(ref, () => ({
    scrollToItem: (index: number) => {
      if (itemsPerRow > 0) {
        const rowIndex = Math.floor(index / itemsPerRow);
        listRef.current?.scrollTo(rowIndex);
      }
    },
  }));

  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - padding * 2;
    const maxItems = Math.floor((containerWidth + columnGap) / (minItemWidth + columnGap));
    const minItems = Math.ceil((containerWidth + columnGap) / (maxItemWidth + columnGap));
    let bestItemsPerRow = Math.max(1, minItems);

    for (let items = minItems; items <= maxItems; items++) {
      const calculatedWidth = (containerWidth - (items - 1) * columnGap) / items;
      if (calculatedWidth >= minItemWidth && calculatedWidth <= maxItemWidth) {
        bestItemsPerRow = items;
        if (calculatedWidth > maxItemWidth * 0.9) break;
      }
    }

    const finalWidth = Math.floor((containerWidth - (bestItemsPerRow - 1) * columnGap) / bestItemsPerRow);
    setItemsPerRow(bestItemsPerRow);
    setItemWidth(finalWidth);
    setResponsiveGridCardWidth(finalWidth);
    onItemsPerRowChange?.(bestItemsPerRow);
  }, [minItemWidth, maxItemWidth, columnGap, padding, setResponsiveGridCardWidth, onItemsPerRowChange]);

  const debouncedResize = useMemo(() => debounce(calculateLayout, 100), [calculateLayout]);

  useEffect(() => {
    return () => {
      debouncedResize.cancel();
    };
  }, [debouncedResize]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!responsiveGridCardWidthRef.current) calculateLayout();
    window.addEventListener('resize', debouncedResize);
    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
    };
  }, [calculateLayout, debouncedResize]);

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < dataSource.length; i += itemsPerRow) {
      result.push({
        key: Math.floor(i / itemsPerRow),
        items: dataSource.slice(i, i + itemsPerRow),
      });
    }
    return result;
  }, [dataSource, itemsPerRow]);

  const itemHeight = itemWidth + 40;

  return (
    <div ref={containerRef} className={`responsive-grid-container ${className}`} style={{ width: '100%', height: '100%' }}>
      <List
        ref={listRef}
        data={rows}
        height={height}
        itemHeight={130}
        itemKey="key"
      >
        {(row, rowIndex) => (
          <div
            style={{
              display: 'flex',
              gap: columnGap,
              marginBottom: rowGap,
              paddingLeft: padding,
              paddingRight: padding,
            }}
          >
            {row.items.map((item, colIndex) => {
               const globalIndex = rowIndex * itemsPerRow + colIndex;
               return (
                 <div key={colIndex} style={{ width: itemWidth, flex: `0 0 ${itemWidth}px` }} className="responsive-grid-item">
                   {renderItem(item, globalIndex)}
                 </div>
               );
            })}
          </div>
        )}
      </List>
    </div>
  );
});

export default VirtualResponsiveGrid;
