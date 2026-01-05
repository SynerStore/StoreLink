import React, { useState, useEffect, useRef, useCallback, useMemo, CSSProperties } from 'react';
import { debounce } from 'lodash-es';

interface ResponsiveGridProps {
  /** 容器最小宽度 */
  minItemWidth?: number;
  /** 容器最大宽度 */
  maxItemWidth?: number;
  /** 行间距 */
  rowGap?: number;
  /** 列间距 */
  columnGap?: number;
  /** 内容 */
  children: React.ReactNode;
  /** 容器额外样式 */
  className?: string;
  /** 是否监听窗口大小变化 */
  responsive?: boolean;
  /** 容器内边距 */
  padding?: number;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  minItemWidth = 60,
  maxItemWidth = 100,
  rowGap = 16,
  columnGap = 16,
  children,
  className = '',
  responsive = true,
  padding = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState<number>(maxItemWidth);
  const [itemsPerRow, setItemsPerRow] = useState<number>(1);

  // 计算最佳的宽度和每行个数
  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth - padding * 2;

    // 计算在不小于最小宽度的前提下，每行最多能放多少个元素
    const maxItems = Math.floor((containerWidth + columnGap) / (minItemWidth + columnGap));

    // 计算在不超过最大宽度的前提下，每行最少需要放多少个元素
    const minItems = Math.ceil((containerWidth + columnGap) / (maxItemWidth + columnGap));

    // 在最小和最大之间选择最佳的个数
    let bestItemsPerRow = Math.max(1, minItems);

    // 尝试找到更优化的布局
    for (let items = minItems; items <= maxItems; items++) {
      // 计算这种布局下的实际宽度
      const calculatedWidth = (containerWidth - (items - 1) * columnGap) / items;

      // 如果计算出的宽度在范围内，并且更接近理想宽度（平均分布）
      if (calculatedWidth >= minItemWidth && calculatedWidth <= maxItemWidth) {
        bestItemsPerRow = items;
        // 如果计算出的宽度接近最大值，优先选择这个布局
        if (calculatedWidth > maxItemWidth * 0.9) {
          break;
        }
      }
    }

    // 计算最终每个元素的宽度
    const finalWidth = Math.floor((containerWidth - (bestItemsPerRow - 1) * columnGap) / bestItemsPerRow);

    setItemsPerRow(bestItemsPerRow);
    setItemWidth(finalWidth);
  }, [minItemWidth, maxItemWidth, columnGap, padding]);

  // 使用 lodash 的 debounce 创建防抖函数
  const debouncedResize = useMemo(
    () => debounce(calculateLayout, 100),
    [calculateLayout],
  );

  // 组件卸载时取消 debounce
  useEffect(() => {
    return () => {
      debouncedResize.cancel();
    };
  }, [debouncedResize]);

  // 初始化和监听窗口大小变化
  useEffect(() => {
    if (!containerRef.current) return;

    // 初始计算
    calculateLayout();

    if (!responsive) return;

    // 监听窗口大小变化
    window.addEventListener('resize', debouncedResize);

    // 使用ResizeObserver监听容器本身的大小变化
    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [calculateLayout, responsive, debouncedResize]);

  // 处理子元素
  const childrenArray = React.Children.toArray(children);
  const totalRows = Math.ceil(childrenArray.length / itemsPerRow);

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${rowGap}px ${columnGap}px`,
    padding: `${padding}px`,
    boxSizing: 'border-box',
    width: '100%',
    overflowX: 'hidden',
  };

  const itemStyle: CSSProperties = {
    flex: `0 0 ${itemWidth}px`,
    width: `${itemWidth}px`,
    boxSizing: 'border-box',
    minWidth: `${minItemWidth}px`,
    maxWidth: `${maxItemWidth}px`,
  };

  return (
    <div ref={containerRef} className={`responsive-grid-container ${className}`} style={containerStyle}>
      {childrenArray.map((child, index) => (
        <div key={index} className="responsive-grid-item" style={itemStyle}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default ResponsiveGrid;
