import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Tooltip } from 'antd';
import { debounce } from 'lodash-es';

import { FileIcon, FileContextMenu, ResponsiveGrid } from '@/renderer/components';
import { calculateSize } from '@/renderer/utils';
import { FileCardListProps, rangeSelectKeys, toggleSelectionKey } from './types';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';

const FileCardList: React.FC<FileCardListProps> = (props) => {
  const { t } = useTranslation();
  const {
    data,
    connectionId,
    onPrefixChange,
    onFileView,
    onDownload,
    onDelete,
    onRename,
    onMoveTo,
    onCopyTo,
    onSelectionChange,
    selectedKeys: propSelectedKeys,
    className = '',
    itemClassName = '',
    minItemWidth = 80,
    maxItemWidth = 100,
    columnGap = 12,
    rowGap = 12,
  } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const clickDebounce = useMemo(() => debounce((fn: Function) => fn(), 200), []);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>([]);
  const selectedKeys = propSelectedKeys !== undefined ? propSelectedKeys : internalSelectedKeys;

  const [lastSelectedKey, setLastSelectedKey] = useState<React.Key | null>(null);
  const [focusedKey, setFocusedKey] = useState<React.Key | null>(null);
  const [lassoing, setLassoing] = useState(false);
  const [lassoStart, setLassoStart] = useState<{ x: number; y: number } | null>(null);
  const [lassoRect, setLassoRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const triggerSelectionChange = useCallback(
    (newKeys: React.Key[]) => {
      if (propSelectedKeys === undefined) {
        setInternalSelectedKeys(newKeys);
      }
      onSelectionChange?.(newKeys);
    },
    [onSelectionChange, propSelectedKeys],
  );

  const getIndex = useCallback((key: React.Key) => data.findIndex((d) => (d.key as React.Key) === key), [data]);

  const handleFileClick = (record: any) => {
    if (record.isDirectory) {
      onPrefixChange(record.key as string);
    } else {
      onFileView(record);
    }
  };

  const handleItemClick = (item: any, e: React.MouseEvent) => {
    const key = item.key as React.Key;
    let newSelectedKeys = [...selectedKeys];
    if (e.ctrlKey || e.metaKey) {
      newSelectedKeys = toggleSelectionKey(newSelectedKeys, key);
      setLastSelectedKey(key);
      setFocusedKey(key);
    } else if (e.shiftKey && lastSelectedKey !== null) {
      const rangeKeys = rangeSelectKeys(data, lastSelectedKey, key);
      if (rangeKeys.length > 0) {
        newSelectedKeys = rangeKeys;
      }
      setFocusedKey(key);
    } else {
      newSelectedKeys = [key];
      setLastSelectedKey(key);
      setFocusedKey(key);
    }
    triggerSelectionChange(newSelectedKeys);
  };

  const computeItemsPerRow = useCallback(() => {
    const container = wrapperRef.current?.querySelector('.responsive-grid-container') as HTMLDivElement | null;
    const item = wrapperRef.current?.querySelector('.responsive-grid-item') as HTMLDivElement | null;
    if (!container || !item) return 1;
    const containerWidth = container.clientWidth;
    const itemWidth = item.clientWidth;
    const perRow = Math.max(1, Math.floor((containerWidth + columnGap) / (itemWidth + columnGap)));
    return perRow;
  }, [columnGap]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (data.length === 0) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      triggerSelectionChange(data.map((d) => d.key as React.Key));
      return;
    }
    let nextIndex = -1;
    const currentIndex = focusedKey ? getIndex(focusedKey) : -1;
    if (e.key === 'ArrowDown') {
      nextIndex = currentIndex + 1 < data.length ? currentIndex + 1 : currentIndex;
    } else if (e.key === 'ArrowUp') {
      nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : 0;
    } else if (e.key === 'ArrowRight') {
      const perRow = computeItemsPerRow();
      nextIndex = currentIndex + 1 < data.length ? currentIndex + 1 : currentIndex;
      if (perRow > 1 && currentIndex >= 0) {
        const rowStart = currentIndex - (currentIndex % perRow);
        const rowEnd = Math.min(rowStart + perRow - 1, data.length - 1);
        nextIndex = Math.min(currentIndex + 1, rowEnd);
      }
    } else if (e.key === 'ArrowLeft') {
      const perRow = computeItemsPerRow();
      if (currentIndex <= 0) nextIndex = 0;
      else {
        if (perRow > 1) {
          const rowStart = currentIndex - (currentIndex % perRow);
          nextIndex = Math.max(currentIndex - 1, rowStart);
        } else {
          nextIndex = currentIndex - 1;
        }
      }
    } else {
      return;
    }
    if (nextIndex === -1) nextIndex = 0;
    const nextKey = data[nextIndex].key as React.Key;
    setFocusedKey(nextKey);
    if (e.shiftKey) {
      if (lastSelectedKey === null) {
        setLastSelectedKey(data[currentIndex >= 0 ? currentIndex : 0].key as React.Key);
      }
      const anchorKey = lastSelectedKey || (data[0].key as React.Key);
      const anchorIndex = getIndex(anchorKey);
      const start = Math.min(anchorIndex, nextIndex);
      const end = Math.max(anchorIndex, nextIndex);
      const rangeKeys = data.slice(start, end + 1).map((d) => d.key as React.Key);
      triggerSelectionChange(rangeKeys);
    } else {
      setLastSelectedKey(nextKey);
      triggerSelectionChange([nextKey]);
    }
  };

  const handleDragStart = (_e: React.DragEvent<HTMLDivElement>, item: any) => {
    const key = item.key as React.Key;
    let currentSelectedKeys = selectedKeys;
    if (!selectedKeys.includes(key)) {
      currentSelectedKeys = [key];
      triggerSelectionChange(currentSelectedKeys);
      setLastSelectedKey(key);
      setFocusedKey(key);
    }
  };

  const rectFromPoints = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(start.x - end.x);
    const h = Math.abs(start.y - end.y);
    return { x, y, w, h };
  };

  const intersects = (
    r1: { x: number; y: number; w: number; h: number },
    r2: { x: number; y: number; w: number; h: number },
  ) => {
    return !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y);
  };

  const startLasso = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.item}`)) return;
    const bounds = wrapperRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const start = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    setLassoStart(start);
    setLassoRect({ x: start.x, y: start.y, w: 0, h: 0 });
    setLassoing(true);
  };

  useEffect(() => {
    if (!lassoing) return;
    const bounds = wrapperRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const handleMove = (e: MouseEvent) => {
      if (!lassoStart) return;
      const cur = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
      const rect = rectFromPoints(lassoStart, cur);
      setLassoRect(rect);
      const items = Array.from(wrapperRef.current?.querySelectorAll('.responsive-grid-item') || []);
      const selected: React.Key[] = [];
      items.forEach((el) => {
        const inner = el.querySelector(`.${styles.item}`) as HTMLDivElement | null;
        if (!inner) return;
        const keyAttr = inner.getAttribute('data-key') as string | null;
        if (!keyAttr) return;
        const r = inner.getBoundingClientRect();
        const rr = { x: r.left - bounds.left, y: r.top - bounds.top, w: r.width, h: r.height };
        if (intersects(rect, rr)) {
          selected.push(keyAttr);
        }
      });
      triggerSelectionChange(selected);
    };
    const handleUp = () => {
      setLassoing(false);
      setLassoStart(null);
      setLassoRect(null);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp, { once: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [lassoing, lassoStart, triggerSelectionChange]);

  return (
    <div
      className={`${styles.container} ${className}`}
      tabIndex={0}
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      onMouseDown={startLasso}
    >
      <ResponsiveGrid minItemWidth={minItemWidth} maxItemWidth={maxItemWidth} columnGap={columnGap} rowGap={rowGap}>
        {data.map((item) => {
          return (
            <FileContextMenu
              key={item.key}
              data={item}
              onDetail={() => {}}
              onRename={onRename}
              onDelete={onDelete}
              onDownload={onDownload}
              onMoveTo={onMoveTo}
              onCopyTo={onCopyTo}
            >
              <Tooltip
                placement="bottom"
                trigger="click"
                title={
                  <div>
                    <div>
                      {t('common.name')}:{item.name}
                    </div>
                    <div>
                      {t('common.size')}:{calculateSize(item.size as number)}
                    </div>
                    <div>
                      {t('common.modified')}:{dayjs(item.lastModified).format('YYYY-MM-DD HH:mm:ss')}
                    </div>
                  </div>
                }
              >
                <div
                  draggable="true"
                  className={`${styles.item} ${itemClassName} ${
                    selectedKeys.includes(item.key as React.Key) ? styles.selected : ''
                  }`}
                  data-info={JSON.stringify({
                    connectionId,
                    key: item.key,
                  })}
                  data-key={item.key as React.Key}
                  data-selected={selectedKeys.includes(item.key as React.Key) ? 'true' : 'false'}
                  onClick={(e) => {
                    e.stopPropagation();
                    clickDebounce(() => {
                      handleItemClick(item, e);
                    });
                  }}
                  onDoubleClick={() => {
                    clickDebounce.cancel();
                    handleFileClick(item);
                  }}
                  onDragStart={(e) => handleDragStart(e, item)}
                >
                  {item.isDirectory ? (
                    <Fragment>
                      <FileIcon size="large" type="folder" />
                      <div className={styles.fileName}>{item.name}</div>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <FileIcon size="large" mime={item.mime as string} />
                      <div className={styles.fileName}>{item.name}</div>
                    </Fragment>
                  )}
                </div>
              </Tooltip>
            </FileContextMenu>
          );
        })}
      </ResponsiveGrid>
      {lassoRect ? (
        <div
          className={styles.lassoRect}
          style={{
            left: lassoRect.x,
            top: lassoRect.y,
            width: lassoRect.w,
            height: lassoRect.h,
          }}
        />
      ) : null}
    </div>
  );
};

export default FileCardList;
