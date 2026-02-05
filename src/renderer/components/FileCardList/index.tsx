import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Tooltip } from 'antd';
import { debounce } from 'lodash-es';

import { FileIcon, FileContextMenu, FileMoveConfirmModal } from '@/renderer/components';
import VirtualResponsiveGrid, { VirtualResponsiveGridRef } from '../ResponsiveGrid/VirtualResponsiveGrid';
import { calculateSize } from '@/renderer/utils';
import { FileCardListProps, rangeSelectKeys, toggleSelectionKey } from './types';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { TStoreObject } from '@/types';

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
    onDropMove,
    onSelectionChange,
    selectedKeys: propSelectedKeys,
    className = '',
    itemClassName = '',
    minItemWidth = 80,
    maxItemWidth = 100,
    columnGap = 12,
    rowGap = 12,
    height,
  } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const virtualGridRef = useRef<VirtualResponsiveGridRef>(null);
  const clickDebounce = useMemo(() => debounce((fn: Function) => fn(), 200), []);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>([]);
  const selectedKeys = propSelectedKeys !== undefined ? propSelectedKeys : internalSelectedKeys;

  const [lastSelectedKey, setLastSelectedKey] = useState<React.Key | null>(null);
  const [focusedKey, setFocusedKey] = useState<React.Key | null>(null);
  const [lassoing, setLassoing] = useState(false);
  const [lassoStart, setLassoStart] = useState<{ x: number; y: number } | null>(null);
  const [lassoRect, setLassoRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [lassoSelectedKeys, setLassoSelectedKeys] = useState<React.Key[]>([]);
  const [virtualItemsPerRow, setVirtualItemsPerRow] = useState(1);

  // Drag and drop state
  const [dragOverKey, setDragOverKey] = useState<React.Key | null>(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [moveSourceFiles, setMoveSourceFiles] = useState<TStoreObject[]>([]);
  const [moveTargetFolder, setMoveTargetFolder] = useState<TStoreObject | null>(null);

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
      const perRow = virtualItemsPerRow;
      nextIndex = currentIndex + 1 < data.length ? currentIndex + 1 : currentIndex;
      if (perRow > 1 && currentIndex >= 0) {
        const rowStart = currentIndex - (currentIndex % perRow);
        const rowEnd = Math.min(rowStart + perRow - 1, data.length - 1);
        nextIndex = Math.min(currentIndex + 1, rowEnd);
      }
    } else if (e.key === 'ArrowLeft') {
      const perRow = virtualItemsPerRow;
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
    virtualGridRef.current?.scrollToItem(nextIndex);

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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: any) => {
    e.stopPropagation();
    const key = item.key as React.Key;
    let currentSelectedKeys = selectedKeys;
    if (!selectedKeys.includes(key)) {
      currentSelectedKeys = [key];
      triggerSelectionChange(currentSelectedKeys);
      setLastSelectedKey(key);
      setFocusedKey(key);
    }
    
    // Set data for drag
    const dragKeys = currentSelectedKeys;
    e.dataTransfer.setData('application/json', JSON.stringify({
      keys: dragKeys,
      connectionId
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.isDirectory) return;
    
    // Check if dragging self or dragging into selection
    // Note: Can't easily access dragged data here safely without keeping track of it
    // But we can check if the target is in the selectedKeys (which we are dragging)
    if (selectedKeys.includes(item.key as React.Key)) return;

    setDragOverKey(item.key as React.Key);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverKey === item.key) {
      setDragOverKey(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);

    if (!item.isDirectory) return;
    
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      
      const dragData = JSON.parse(dataStr);
      
      let keys: React.Key[] = [];
      let srcConnId: string | undefined;

      if (Array.isArray(dragData)) {
         if (dragData.length > 0) {
             srcConnId = dragData[0].connectionId;
             keys = dragData.map((d: any) => d.key);
         }
      } else {
         srcConnId = dragData.connectionId;
         keys = dragData.keys;
      }

      if (srcConnId !== connectionId) return; // Only allow same connection for now
      
      if (keys.includes(item.key as React.Key)) return; // Cannot drop into itself
      
      const sourceFiles = data.filter(d => keys.includes(d.key as React.Key));
      
      if (sourceFiles.length > 0) {
        setMoveSourceFiles(sourceFiles);
        setMoveTargetFolder(item);
        setMoveModalVisible(true);
      }
    } catch (err) {
      console.error('Drop error', err);
    }
  };

  const handleConfirmMove = async () => {
    if (moveSourceFiles.length > 0 && moveTargetFolder && onDropMove) {
      await onDropMove(moveSourceFiles.map(f => f.key as React.Key), moveTargetFolder);
    }
    setMoveModalVisible(false);
    setMoveSourceFiles([]);
    setMoveTargetFolder(null);
  };

  const handleCancelMove = () => {
    setMoveModalVisible(false);
    setMoveSourceFiles([]);
    setMoveTargetFolder(null);
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
    e.stopPropagation();
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

    let currentSelected: React.Key[] = [];

    const handleMove = (e: MouseEvent) => {
      if (!lassoStart) return;
      const cur = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
      const rect = rectFromPoints(lassoStart, cur);
      setLassoRect(rect);
      const items = Array.from(wrapperRef.current?.querySelectorAll(`.${styles.item}`) || []);
      const selected: React.Key[] = [];
      items.forEach((el) => {
        const inner = el as HTMLDivElement;
        const keyAttr = inner.getAttribute('data-key') as string | null;
        if (!keyAttr) return;
        const r = inner.getBoundingClientRect();
        const rr = { x: r.left - bounds.left, y: r.top - bounds.top, w: r.width, h: r.height };
        if (intersects(rect, rr)) {
          selected.push(keyAttr);
        }
      });
      currentSelected = selected;
      setLassoSelectedKeys(selected);
    };
    const handleUp = () => {
      setLassoing(false);
      setLassoStart(null);
      setLassoRect(null);
      triggerSelectionChange(currentSelected);
      setLassoSelectedKeys([]);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp, { once: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [lassoing, lassoStart, triggerSelectionChange]);

  const renderItem = (item: any) => {
    const isDragOver = dragOverKey === item.key;
    const isSelected = (lassoing ? lassoSelectedKeys : selectedKeys).includes(item.key as React.Key);

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
            className={`${styles.item} ${itemClassName} ${isSelected ? styles.selected : ''}`}
            style={isDragOver ? { border: '2px dashed var(--primary-color)', background: 'rgba(24, 144, 255, 0.1)' } : {}}
            data-info={JSON.stringify({
              connectionId,
              key: item.key,
            })}
            data-key={item.key as React.Key}
            data-selected={isSelected ? 'true' : 'false'}
            onClick={(e) => {
              e.stopPropagation();
              clickDebounce(() => {
                handleItemClick(item, e);
              });
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              clickDebounce.cancel();
              handleFileClick(item);
            }}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleDragOver(e, item)}
            onDragLeave={(e) => handleDragLeave(e, item)}
            onDrop={(e) => handleDrop(e, item)}
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
  };

  return (
    <div
      className={`${styles.container} ${className}`}
      tabIndex={0}
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      onMouseDown={startLasso}
    >
      <VirtualResponsiveGrid
        ref={virtualGridRef}
        dataSource={data}
        renderItem={renderItem}
        minItemWidth={minItemWidth}
        maxItemWidth={maxItemWidth}
        columnGap={columnGap}
        rowGap={rowGap}
        height={height}
        onItemsPerRowChange={setVirtualItemsPerRow}
      />
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
      
      <FileMoveConfirmModal 
        open={moveModalVisible}
        sourceFiles={moveSourceFiles}
        targetFolder={moveTargetFolder}
        onConfirm={handleConfirmMove}
        onCancel={handleCancelMove}
      />
    </div>
  );
};

export default FileCardList;
