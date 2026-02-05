import { TStoreObject } from '@/types';

export type FileCardListProps = {
  data: TStoreObject[];
  connectionId?: string;
  onPrefixChange: (prefix: string) => void;
  onFileView: (data: any) => void;
  onDownload?: (data: any) => Promise<void>;
  onDelete?: (data: any) => Promise<void>;
  onRename?: (data: any, newName: string) => Promise<void>;
  onMoveTo?: (data: any) => Promise<void>;
  onCopyTo?: (data: any) => Promise<void>;
  onDropMove?: (sourceKeys: React.Key[], targetFolder: TStoreObject) => Promise<void>;
  onSelectionChange?: (selectedKeys: React.Key[]) => void;
  selectedKeys?: React.Key[];
  className?: string;
  itemClassName?: string;
  minItemWidth?: number;
  maxItemWidth?: number;
  columnGap?: number;
  rowGap?: number;
  height?: number;
};

export const rangeSelectKeys = (items: TStoreObject[], anchor: React.Key, current: React.Key): React.Key[] => {
  const findIndex = (key: React.Key) => items.findIndex((d) => (d.key as React.Key) === key);
  const a = findIndex(anchor);
  const b = findIndex(current);
  if (a < 0 || b < 0) return [];
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  return items.slice(start, end + 1).map((d) => d.key as React.Key);
};

export const toggleSelectionKey = (keys: React.Key[], key: React.Key): React.Key[] => {
  return keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key];
};
