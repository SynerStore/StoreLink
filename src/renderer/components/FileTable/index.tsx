import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Table, Skeleton } from 'antd';
import type { TableProps } from 'antd';
import { debounce } from 'lodash-es';
import FileMoveConfirmModal from '../FileMoveConfirmModal';
import { TStoreObject } from '@/types';
import './index.css';

// 可调整大小的表头组件
interface ResizableTitleProps {
  onResize?: (width: number) => void;
  width?: number;
  [key: string]: any;
}

const ResizableTitle: React.FC<ResizableTitleProps> = (props) => {
  const { onResize, width, ...restProps } = props;
  const handleRef = useRef<HTMLSpanElement>(null);

  // 如果没有 onResize 或 width，直接渲染原始 th
  if (!onResize || width === undefined) {
    return <th {...restProps} />;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      requestAnimationFrame(() => {
        const newWidth = startWidth + moveEvent.clientX - startX;
        const clampedWidth = Math.max(50, newWidth);
        onResize(clampedWidth);
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <th {...restProps}>
      {restProps.children}
      <span
        ref={handleRef}
        className="react-resizable-handle"
        onMouseDown={handleMouseDown}
      />
    </th>
  );
};

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
  resizable?: boolean;
  onColumnResize?: (columnKey: string, width: number) => void;
}

export const FileTable = <T extends object = any>(props: FileTableProps<T>) => {
  const {
    dataSource = [],
    rowSelection,
    onRowDragStart,
    onRowDoubleClick,
    connectionId,
    onDropMove,
    columns,
    resizable = false,
    onColumnResize,
    ...restProps
  } = props;

  // 内部选中状态
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>([]);
  // 最后选中的Key（用于Shift范围选择）
  const [lastSelectedKey, setLastSelectedKey] = useState<React.Key | null>(null);
  // 当前焦点Key（用于键盘导航）
  const [focusedKey, setFocusedKey] = useState<React.Key | null>(null);

  // 拖拽相关状态
  const [dragOverKey, setDragOverKey] = useState<React.Key | null>(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [moveSourceFiles, setMoveSourceFiles] = useState<T[]>([]);
  const [moveTargetFolder, setMoveTargetFolder] = useState<T | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  // 防抖处理单击事件，避免双击时触发单击
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

  // 受控与非受控选择逻辑合并
  const selectedKeys = useMemo(() => {
    return rowSelection?.selectedRowKeys ?? internalSelectedKeys;
  }, [rowSelection?.selectedRowKeys, internalSelectedKeys]);

  // 触发选择变更
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
      // Ctrl/Cmd + 点击：切换选中状态
      if (newSelectedKeys.includes(key)) {
        newSelectedKeys = newSelectedKeys.filter((k) => k !== key);
      } else {
        newSelectedKeys.push(key);
      }
      setLastSelectedKey(key);
      setFocusedKey(key);
    } else if (event.shiftKey && lastSelectedKey !== null) {
      // Shift + 点击：范围选择
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
      // 普通点击：单选
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

    // Ctrl/Cmd + A：全选
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
      // Shift + 方向键：扩展选区
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
      // 方向键：移动焦点并选中
      setLastSelectedKey(nextKey);
      triggerSelectionChange([nextKey]);
    }
  };

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent<HTMLElement>, record: T, index: number) => {
    const key = getRowKey(record, index);
    // 拖拽未选中行时先将其选中（视为单选并开始拖拽）
    let currentSelectedKeys = selectedKeys;
    if (!selectedKeys.includes(key)) {
      currentSelectedKeys = [key];
      triggerSelectionChange(currentSelectedKeys);
      setLastSelectedKey(key);
      setFocusedKey(key);
    }

    const selectedRows = dataSource.filter((item: T, i: number) => currentSelectedKeys.includes(getRowKey(item, i)));

    // 设置拖拽数据
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        keys: currentSelectedKeys,
        connectionId,
      }),
    );
    e.dataTransfer.effectAllowed = 'move';

    // 调用外部传入的拖拽开始回调
    if (onRowDragStart) {
      onRowDragStart(e, selectedRows);
    }
  };

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent<HTMLElement>, record: T, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    // 检查是否拖拽到文件夹上（仅允许拖入文件夹）
    if (!(record as any).isDirectory) {
      if (dragOverKey !== null) setDragOverKey(null);
      return;
    }

    const key = getRowKey(record, index);

    // 设置拖拽经过的高亮Key
    if (dragOverKey !== key) {
      setDragOverKey(key);
    }

    e.dataTransfer.dropEffect = 'move';
  };

  // 拖拽离开行时的样式清理
  const handleRowDragLeave = (e: React.DragEvent<HTMLElement>, record: T, index: number) => {
    const key = getRowKey(record, index);
    if (dragOverKey === key) {
      setDragOverKey(null);
    }
  };

  // 拖拽放下
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

      // 仅支持同连接内的移动
      if (srcConnId !== connectionId) return;

      const key = getRowKey(record, index);
      if (keys.includes(key)) return; // 不能移动到自身

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

  // 确认移动
  const handleConfirmMove = async () => {
    if (onDropMove && moveTargetFolder && moveSourceFiles.length > 0) {
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

  // 取消移动
  const handleCancelMove = () => {
    setMoveModalVisible(false);
    setMoveSourceFiles([]);
    setMoveTargetFolder(null);
  };

  // Antd Table 的 rowSelection 配置
  // 合并内部的选中状态与传入配置
  const antdRowSelection: TableProps<T>['rowSelection'] = {
    ...rowSelection,
    selectedRowKeys: selectedKeys,
    onChange: (keys: React.Key[], _rows: T[]) => {
      // 处理复选框选择变化
      setLastSelectedKey(keys[keys.length - 1] || null);
      setFocusedKey(keys[keys.length - 1] || null);
      triggerSelectionChange(keys);
    },
  };

  // 处理可调整大小的列
  const resizableColumns = useMemo(() => {
    if (!resizable || !columns) return columns;

    return columns.map((col: any) => {
      const key = col.key || col.dataIndex;
      const hasWidth = col.width !== undefined;

      if (!hasWidth) return col;

      return {
        ...col,
        onHeaderCell: (column: any) => ({
          width: column.width,
          onResize: (w: number) => {
            if (onColumnResize && key) {
              onColumnResize(key, w);
            }
          },
        }),
      };
    });
  }, [columns, resizable, onColumnResize]);

  // 表头组件
  const components = useMemo(() => {
    if (!resizable) return undefined;

    return {
      header: {
        cell: ResizableTitle,
      },
    };
  }, [resizable]);

  // 骨架屏渲染
  if (restProps.loading) {
    return (
      <div className="file-table-wrapper" style={{ padding: '16px 24px' }}>
        <Skeleton active title={false} paragraph={{ rows: 10, width: '100%' }} />
      </div>
    );
  }

  return (
    <div className="file-table-wrapper" tabIndex={0} onKeyDown={handleKeyDown} ref={wrapperRef}>
      <Table
        {...restProps}
        loading={false}
        virtual
        dataSource={dataSource}
        columns={resizableColumns}
        components={components}
        rowSelection={antdRowSelection}
        pagination={false}
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
