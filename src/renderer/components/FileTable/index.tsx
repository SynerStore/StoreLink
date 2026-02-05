import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { debounce } from 'lodash-es';
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
  const { dataSource = [], rowSelection, onRowDragStart, onRowDoubleClick, columns, ...restProps } = props;

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>([]);
  const [lastSelectedKey, setLastSelectedKey] = useState<React.Key | null>(null);
  const [focusedKey, setFocusedKey] = useState<React.Key | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const clickDebounce = useMemo(() => debounce((fn: Function) => fn(), 200), []);

  // 获取行键值的辅助函数
  const getRowKey = useCallback(
    (record: T, index?: number): React.Key => {
      if (typeof restProps.rowKey === 'function') {
        return restProps.rowKey(record, index);
      }
      if (typeof restProps.rowKey === 'string') {
        return (record as any)[restProps.rowKey];
      }
      // 未提供 rowKey 时的回退（通常 antd 需要显式 rowKey 或 key 属性）
      return (record as any).key;
    },
    [restProps.rowKey],
  );

  // 受控与非受控选择逻辑
  const selectedKeys = useMemo(() => {
    return rowSelection?.selectedRowKeys ?? internalSelectedKeys;
  }, [rowSelection?.selectedRowKeys, internalSelectedKeys]);

  const triggerSelectionChange = (newKeys: React.Key[]) => {
    if (!rowSelection?.selectedRowKeys) {
      setInternalSelectedKeys(newKeys);
    }

    if (rowSelection?.onChange) {
      const selectedRows = dataSource.filter((item: T, index: number) => newKeys.includes(getRowKey(item, index)));
      rowSelection.onChange(newKeys, selectedRows);
    }
  };

  // 根据键值获取行索引
  const getIndex = (key: React.Key) => dataSource.findIndex((item: T, index: number) => getRowKey(item, index) === key);

  // 处理行点击
  const onRowClick = (record: T, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const key = getRowKey(record, index);
    let newSelectedKeys = [...selectedKeys];

    if (event.ctrlKey || event.metaKey) {
      // 切换选中状态
      if (newSelectedKeys.includes(key)) {
        newSelectedKeys = newSelectedKeys.filter((k) => k !== key);
      } else {
        newSelectedKeys.push(key);
      }
      setLastSelectedKey(key);
      setFocusedKey(key);
    } else if (event.shiftKey && lastSelectedKey !== null) {
      // 范围选择
      const lastIndex = getIndex(lastSelectedKey);
      const currentIndex = index;
      if (lastIndex >= 0 && currentIndex >= 0) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeKeys = dataSource.slice(start, end + 1).map((item: T, idx: number) => getRowKey(item, start + idx));
        newSelectedKeys = rangeKeys;
      }
      setFocusedKey(key);
    } else {
      // 单选
      newSelectedKeys = [key];
      setLastSelectedKey(key);
      setFocusedKey(key);
    }

    triggerSelectionChange(newSelectedKeys);
  };

  // 处理键盘操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (dataSource.length === 0) return;

    // 阻止方向键导致的默认滚动
    if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
      e.preventDefault();
    }

    // 全选
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      triggerSelectionChange(dataSource.map((d: T, i: number) => getRowKey(d, i)));
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

    if (nextIndex === -1) nextIndex = 0; // 无焦点时默认聚焦第一行

    const nextKey = getRowKey(dataSource[nextIndex], nextIndex);
    setFocusedKey(nextKey);

    // 将焦点行滚动到视区
    const rowElement = wrapperRef.current?.querySelector(`tr[data-row-key="${nextKey}"]`);
    rowElement?.scrollIntoView({ block: 'nearest' });

    if (e.shiftKey) {
      // 扩展选区
      if (lastSelectedKey === null) {
        setLastSelectedKey(
          getRowKey(dataSource[currentIndex >= 0 ? currentIndex : 0], currentIndex >= 0 ? currentIndex : 0),
        );
      }

      const anchorKey = lastSelectedKey || getRowKey(dataSource[0], 0);
      const anchorIndex = getIndex(anchorKey);

      const start = Math.min(anchorIndex, nextIndex);
      const end = Math.max(anchorIndex, nextIndex);
      const rangeKeys = dataSource.slice(start, end + 1).map((item: T, idx: number) => getRowKey(item, start + idx));
      triggerSelectionChange(rangeKeys);
    } else {
      // 移动焦点并选中
      setLastSelectedKey(nextKey);
      triggerSelectionChange([nextKey]);
    }
  };

  // 拖拽逻辑
  const handleDragStart = (e: React.DragEvent<HTMLElement>, record: T, index: number) => {
    const key = getRowKey(record, index);
    // 拖拽未选中行时先将其选中（单选）
    let currentSelectedKeys = selectedKeys;
    if (!selectedKeys.includes(key)) {
      currentSelectedKeys = [key];
      triggerSelectionChange(currentSelectedKeys);
      setLastSelectedKey(key);
      setFocusedKey(key);
    }

    const selectedRows = dataSource.filter((item: T, i: number) => currentSelectedKeys.includes(getRowKey(item, i)));

    // 调用回调
    if (onRowDragStart) {
      onRowDragStart(e, selectedRows);
    }
  };

  // Antd Table 的 rowSelection 配置
  // 合并内管的选中状态与传入配置
  const antdRowSelection: TableProps<T>['rowSelection'] = {
    ...rowSelection,
    selectedRowKeys: selectedKeys,
    onChange: (keys: React.Key[], _rows: T[]) => {
      // 处理复选框选择变化
      setLastSelectedKey(keys[keys.length - 1] || null);
      setFocusedKey(keys[keys.length - 1] || null);
      triggerSelectionChange(keys);
    },
    // 保持复选框功能可用
  };

  return (
    <div className="file-table-wrapper" tabIndex={0} onKeyDown={handleKeyDown} ref={wrapperRef}>
      <Table
        {...restProps}
        virtual
        dataSource={dataSource}
        columns={columns}
        rowSelection={antdRowSelection}
        onRow={(record: T, index?: number) => {
          const userOnRow = restProps.onRow ? restProps.onRow(record, index) : {};
          const key = getRowKey(record, index);
          return {
            ...userOnRow,
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              clickDebounce(() => {
                onRowClick(record, index || 0, e);
                userOnRow.onClick?.(e as any);
              });
            },
            onDoubleClick: (e: React.MouseEvent<HTMLElement>) => {
              clickDebounce.cancel();
              onRowDoubleClick?.(record);
              userOnRow.onDoubleClick?.(e as any);
            },
            draggable: true,
            onDragStart: (e: React.DragEvent<HTMLElement>) => {
              handleDragStart(e, record, index || 0);
              userOnRow.onDragStart?.(e as any);
            },
            className: `${userOnRow.className || ''} ${focusedKey === key ? 'file-table-row-focused' : ''}`,
          };
        }}
      />
    </div>
  );
};
