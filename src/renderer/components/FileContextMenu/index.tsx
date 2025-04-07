import React, { useMemo } from 'react';
import { Space } from '@arco-design/web-react';

import { IconDownload, IconInfoCircle, IconEdit, IconEye, IconDelete, IconCopy } from '@arco-design/web-react/icon';
import ContextMenu, { MenuItem } from '@/renderer/components/ContextMenu';
import FileRenameWrap from '@/renderer/components/FileRenameWrap';
import FileDeteleWrap from '@/renderer/components/FileDeteleWrap';

export type FileContextMenuProps = {
  data: any;
  onDetail?: (data: any) => void;
  onDownload?: (data: any) => Promise<void>;
  onDelete?: (data: any) => Promise<void>;
  onRename?: (data: any, newName: string) => Promise<void>;
  onOpen?: (data: any) => Promise<void>;
  onCopy?: (data: any) => Promise<void>;
  children?: React.ReactNode;
};

const FileContextMenu = (props: any) => {
  const { data, onDetail, onDownload, onDelete, onRename, onOpen, onCopy, children } = props;

  const menus = useMemo<MenuItem[]>(() => {
    const baseMenus: MenuItem[] = [];

    if (onDetail) {
      baseMenus.push({
        icon: <IconInfoCircle />,
        text: '详情',
        onClick: () => onDetail(data),
      });
    }

    if (onOpen && !data.isDirectory) {
      baseMenus.push({
        icon: <IconEye />,
        text: '查看',
        onClick: () => onOpen(data),
      });
    }

    if (onDownload) {
      baseMenus.push({
        icon: <IconDownload />,
        text: '下载',
        onClick: () => onDownload(data),
      });
    }

    if (onCopy) {
      baseMenus.push({
        icon: <IconCopy />,
        text: '复制',
        onClick: () => onCopy(data),
      });
    }

    if (onRename) {
      baseMenus.push({
        render: () => (
          <FileRenameWrap name={data.name as string} onRename={(newName: string) => onRename(data, newName)}>
            <Space size={1}>
              <IconEdit /> 重命名
            </Space>
          </FileRenameWrap>
        ),
      });
    }

    if (onDelete) {
      baseMenus.push({
        render: () => (
          <FileDeteleWrap fileInfo={data} onDelete={onDelete}>
            <Space size={1}>
              <IconDelete /> 删除
            </Space>
          </FileDeteleWrap>
        ),
      });
    }

    return baseMenus;
  }, [props]);

  return <ContextMenu menu={menus}>{children}</ContextMenu>;
};

export default FileContextMenu;
