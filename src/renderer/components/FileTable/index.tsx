import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import './index.css';

export interface FileTableProps<T> extends Omit<TableProps<T>, 'rowSelection'> {
  rowSelection?: {
    selectedRowKeys?: React.Key[];
    onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
    type?: 'checkbox' | 'radio';
    [key: string]: any;
  };
  onRowDragStart?: (e: React.DragEvent<HTMLElement>, selectedRows: T[]) => void;
  onRowDoubleClick?: (record: T) => void;
}

export const FileTable = <T extends object = any>(props: FileTableProps<T>) => {
  const { 
    dataSource = [], 
    rowSelection, 
    onRowDragStart, 
    onRowDoubleClick,
    columns,
    ...restProps 
  } = props;

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>([]);
  const [lastSelectedKey, setLastSelectedKey] = useState<React.Key | null>(null);
  const [focusedKey, setFocusedKey] = useState<React.Key | null>(null);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Helper to get key
  const getRowKey = useCallback((record: T, index?: number): React.Key => {
    if (typeof restProps.rowKey === 'function') {
      return restProps.rowKey(record, index);
    }
    if (typeof restProps.rowKey === 'string') {
      return (record as any)[restProps.rowKey];
    }
    // Fallback if no rowKey provided (usually antd requires rowKey if no key prop)
    return (record as any).key;
  }, [restProps.rowKey]);

  // Controlled vs Uncontrolled logic
  const selectedKeys = useMemo(() => {
    return rowSelection?.selectedRowKeys ?? internalSelectedKeys;
  }, [rowSelection?.selectedRowKeys, internalSelectedKeys]);

  const triggerSelectionChange = (newKeys: React.Key[]) => {
    if (!rowSelection?.selectedRowKeys) {
      setInternalSelectedKeys(newKeys);
    }
    
    if (rowSelection?.onChange) {
      const selectedRows = dataSource.filter((item, index) => newKeys.includes(getRowKey(item, index)));
      rowSelection.onChange(newKeys, selectedRows);
    }
  };

  // Helper to get index
  const getIndex = (key: React.Key) => dataSource.findIndex((item, index) => getRowKey(item, index) === key);

  // Handle Row Click
  const onRowClick = (record: T, index: number, event: React.MouseEvent) => {
    const key = getRowKey(record, index);
    let newSelectedKeys = [...selectedKeys];

    if (event.ctrlKey || event.metaKey) {
      // Toggle
      if (newSelectedKeys.includes(key)) {
        newSelectedKeys = newSelectedKeys.filter(k => k !== key);
      } else {
        newSelectedKeys.push(key);
      }
      setLastSelectedKey(key);
      setFocusedKey(key);
    } else if (event.shiftKey && lastSelectedKey !== null) {
      // Range select
      const lastIndex = getIndex(lastSelectedKey);
      const currentIndex = index;
      if (lastIndex >= 0 && currentIndex >= 0) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeKeys = dataSource.slice(start, end + 1).map((item, idx) => getRowKey(item, start + idx));
        newSelectedKeys = rangeKeys;
      }
      setFocusedKey(key);
    } else {
      // Single select
      newSelectedKeys = [key];
      setLastSelectedKey(key);
      setFocusedKey(key);
    }

    triggerSelectionChange(newSelectedKeys);
  };

  // Handle Keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (dataSource.length === 0) return;

    // Prevent default scrolling for arrows
    if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
      e.preventDefault();
    }

    // Select All
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      triggerSelectionChange(dataSource.map((d, i) => getRowKey(d, i)));
      return;
    }

    let nextIndex = -1;
    const currentIndex = focusedKey ? getIndex(focusedKey) : -1;

    if (e.key === 'ArrowDown') {
      nextIndex = currentIndex + 1 < dataSource.length ? currentIndex + 1 : currentIndex;
    } else if (e.key === 'ArrowUp') {
      nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : 0;
    } else {
      return;
    }
    
    if (nextIndex === -1) nextIndex = 0; // Default to first if nothing focused

    const nextKey = getRowKey(dataSource[nextIndex], nextIndex);
    setFocusedKey(nextKey);
    
    // Scroll into view
    const rowElement = wrapperRef.current?.querySelector(`tr[data-row-key="${nextKey}"]`);
    rowElement?.scrollIntoView({ block: 'nearest' });

    if (e.shiftKey) {
      // Extend selection
      if (lastSelectedKey === null) {
        setLastSelectedKey(getRowKey(dataSource[currentIndex >= 0 ? currentIndex : 0], currentIndex >= 0 ? currentIndex : 0));
      }
      
      const anchorKey = lastSelectedKey || getRowKey(dataSource[0], 0);
      const anchorIndex = getIndex(anchorKey);
      
      const start = Math.min(anchorIndex, nextIndex);
      const end = Math.max(anchorIndex, nextIndex);
      const rangeKeys = dataSource.slice(start, end + 1).map((item, idx) => getRowKey(item, start + idx));
      triggerSelectionChange(rangeKeys);
    } else {
      // Move and select
      setLastSelectedKey(nextKey);
      triggerSelectionChange([nextKey]);
    }
  };

  // Drag Logic
  const handleDragStart = (e: React.DragEvent<HTMLElement>, record: T, index: number) => {
    const key = getRowKey(record, index);
    // If dragging a row that is NOT in selection, select it first (single select)
    let currentSelectedKeys = selectedKeys;
    if (!selectedKeys.includes(key)) {
      currentSelectedKeys = [key];
      triggerSelectionChange(currentSelectedKeys);
      setLastSelectedKey(key);
      setFocusedKey(key);
    }

    const selectedRows = dataSource.filter((item, i) => currentSelectedKeys.includes(getRowKey(item, i)));
    
    // Call prop
    if (onRowDragStart) {
      onRowDragStart(e, selectedRows);
    }
  };

  // Antd Table rowSelection object
  // We merge our managed selection with provided config
  const antdRowSelection: TableProps<T>['rowSelection'] = {
    ...rowSelection,
    selectedRowKeys: selectedKeys,
    onChange: (keys, rows) => {
      // Handle checkbox changes
      setLastSelectedKey(keys[keys.length - 1] || null);
      setFocusedKey(keys[keys.length - 1] || null);
      triggerSelectionChange(keys);
    },
    // We want to keep the checkbox functionality working
  };

  return (
    <div 
      className="file-table-wrapper" 
      tabIndex={0} 
      onKeyDown={handleKeyDown}
      ref={wrapperRef}
    >
      <Table
        {...restProps}
        dataSource={dataSource}
        columns={columns}
        rowSelection={antdRowSelection}
        onRow={(record, index) => {
          const userOnRow = restProps.onRow ? restProps.onRow(record, index) : {};
          const key = getRowKey(record, index);
          return {
            ...userOnRow,
            onClick: (e) => {
              onRowClick(record, index || 0, e);
              userOnRow.onClick?.(e);
            },
            onDoubleClick: (e) => {
              onRowDoubleClick?.(record);
              userOnRow.onDoubleClick?.(e);
            },
            draggable: true, 
            onDragStart: (e) => {
              handleDragStart(e, record, index || 0);
              userOnRow.onDragStart?.(e);
            },
            className: `${userOnRow.className || ''} ${focusedKey === key ? 'file-table-row-focused' : ''}`,
          };
        }}
      />
    </div>
  );
};
