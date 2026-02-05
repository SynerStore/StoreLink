import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { debounce } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import FileMoveConfirmModal from '../FileMoveConfirmModal';
import { TStoreObject } from '@/types';
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
  connectionId?: string;
  onDropMove?: (sourceKeys: React.Key[], targetFolder: T) => Promise<void>;
}

export const FileTable = <T extends object = any>(props: FileTableProps<T>) => {
  const { dataSource = [], rowSelection, onRowDragStart, onRowDoubleClick, connectionId, onDropMove, columns, ...restProps } = props;

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>([]);
  const [lastSelectedKey, setLastSelectedKey] = useState<React.Key | null>(null);
  const [focusedKey, setFocusedKey] = useState<React.Key | null>(null);
  
  // Drag and drop state
  const [dragOverKey, setDragOverKey] = useState<React.Key | null>(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [moveSourceFiles, setMoveSourceFiles] = useState<T[]>([]);
  const [moveTargetFolder, setMoveTargetFolder] = useState<T | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const clickDebounce = useMemo(() => debounce((fn: Function) => fn(), 200), []);
  const { t } = useTranslation();

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

    // Set data for drag
    e.dataTransfer.setData('application/json', JSON.stringify({
      keys: currentSelectedKeys,
      connectionId
    }));
    e.dataTransfer.effectAllowed = 'move';

    // 调用回调
    if (onRowDragStart) {
      onRowDragStart(e, selectedRows);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>, record: T, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if dragging over a directory
    if (!(record as any).isDirectory) {
      if (dragOverKey !== null) setDragOverKey(null);
      return;
    }

    const key = getRowKey(record, index);
    
    // Check if dragging over selected items (cannot move into itself)
    const dataStr = e.dataTransfer.getData('application/json');
    if (dataStr) {
      // Note: getData might be empty during dragover in some browsers/OS, but we check dragOverKey anyway
    }

    if (dragOverKey !== key) {
      setDragOverKey(key);
    }
    
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset if leaving the row (this might need refinement as dragleave fires when entering children)
    // For now, rely on drop or dragOver on other items to switch key
    // or simple implementation: do nothing here or just careful check relatedTarget
  };
  
  // Refined drag leave to clear style when leaving the table row
  const handleRowDragLeave = (e: React.DragEvent<HTMLElement>, record: T, index: number) => {
    const key = getRowKey(record, index);
    if (dragOverKey === key) {
      setDragOverKey(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, record: T, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);

    if (!(record as any).isDirectory) return;

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

      if (srcConnId !== connectionId) return;

      const key = getRowKey(record, index);
      if (keys.includes(key)) return; // Cannot drop into itself

      const sourceFiles = dataSource.filter((item: T, i: number) => keys.includes(getRowKey(item, i)));

      if (sourceFiles.length > 0) {
        setMoveSourceFiles(sourceFiles);
        setMoveTargetFolder(record);
        setMoveModalVisible(true);
      }
    } catch (err) {
      console.error('Drop error', err);
    }
  };

  const handleConfirmMove = async () => {
    if (onDropMove && moveTargetFolder && moveSourceFiles.length > 0) {
      const sourceKeys = moveSourceFiles.map((file, i) => getRowKey(file, i)); // Note: this might be inaccurate if getRowKey needs index
      // Better to rely on keys if possible, assuming moveSourceFiles are from dataSource
      // Let's re-map keys properly using cached keys or just assume T has key property as fallback
      // Actually moveSourceFiles comes from dataSource filter, so we can use getRowKey but we need index.
      // However, we passed keys in dragData.
      
      // Let's use the keys from dragData if we had them, but we parsed them in handleDrop.
      // We can re-derive keys.
      const keys = moveSourceFiles.map((item) => {
         const idx = dataSource.indexOf(item);
         return getRowKey(item, idx);
      });

      await onDropMove(keys, moveTargetFolder);
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
            onDragOver: (e: React.DragEvent<HTMLElement>) => {
              handleDragOver(e, record, index || 0);
              userOnRow.onDragOver?.(e as any);
            },
            onDragLeave: (e: React.DragEvent<HTMLElement>) => {
              handleRowDragLeave(e, record, index || 0);
              userOnRow.onDragLeave?.(e as any);
            },
            onDrop: (e: React.DragEvent<HTMLElement>) => {
              handleDrop(e, record, index || 0);
              userOnRow.onDrop?.(e as any);
            },
            className: `${userOnRow.className || ''} ${focusedKey === key ? 'file-table-row-focused' : ''} ${dragOverKey === key ? 'file-table-row-drag-over' : ''}`,
          };
        }}
      />
      
      <FileMoveConfirmModal
        open={moveModalVisible}
        sourceFiles={moveSourceFiles as unknown as TStoreObject[]}
        targetFolder={moveTargetFolder as unknown as TStoreObject}
        onConfirm={handleConfirmMove}
        onCancel={handleCancelMove}
      />
    </div>
  );
};
