import { useMemo, useCallback } from 'react';
import { useSettingStore, ColumnWidthConfig } from '@/renderer/store/useSettingStore';

// 默认列宽配置
const DEFAULT_WIDTHS: ColumnWidthConfig = {
  size: 120,
  lastModified: 200,
  storageClass: 180,
};

interface UseColumnWidthsOptions {
  viewerType: 's3' | 'oss' | 'cos' | 'local' | 'sftp' | 'webdav' | 'synology';
}

interface UseColumnWidthsReturn {
  columnWidths: ColumnWidthConfig;
  handleColumnResize: (columnKey: string, width: number) => void;
}

export const useColumnWidths = (options: UseColumnWidthsOptions): UseColumnWidthsReturn => {
  const { viewerType } = options;
  const { settings, update } = useSettingStore();

  // 获取当前 viewer 的列宽配置，合并默认值
  const columnWidths = useMemo(() => {
    const storedWidths = settings.tableColumnWidths?.[viewerType as keyof typeof settings.tableColumnWidths];
    return {
      ...DEFAULT_WIDTHS,
      ...storedWidths,
    };
  }, [settings.tableColumnWidths, viewerType]);

  // 处理列宽调整
  const handleColumnResize = useCallback(
    (columnKey: string, width: number) => {
      const currentWidths = settings.tableColumnWidths || {};
      const viewerWidths = currentWidths[viewerType as keyof typeof currentWidths] || {};

      const newTableColumnWidths = {
        ...currentWidths,
        [viewerType]: {
          ...viewerWidths,
          [columnKey]: Math.max(50, width), // 最小宽度 50px
        },
      };

      update({ tableColumnWidths: newTableColumnWidths });
    },
    [settings.tableColumnWidths, viewerType, update]
  );

  return {
    columnWidths,
    handleColumnResize,
  };
};
