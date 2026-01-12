import React, { useMemo } from 'react';
import { Space } from 'antd';

import {
  DownloadOutlined,
  InfoCircleOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  CopyOutlined,
  ScissorOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { FileRenameWrap, FileDeteleWrap, ContextMenu, MenuItem } from '@/renderer/components';
import { useTranslation } from 'react-i18next';

export type FileContextMenuProps = {
  data: any;
  onDetail?: (data: any) => void;
  onDownload?: (data: any) => Promise<void>;
  onDelete?: (data: any) => Promise<void>;
  onRename?: (data: any, newName: string) => Promise<void>;
  onOpen?: (data: any) => Promise<void>;
  onCopy?: (data: any) => Promise<void>;
  onMoveTo?: (data: any) => Promise<void>;
  onCopyTo?: (data: any) => Promise<void>;
  children?: React.ReactNode;
};

const FileContextMenu = (props: any) => {
  const { data, onDetail, onDownload, onDelete, onRename, onOpen, onCopy, onMoveTo, onCopyTo, children } = props;
  const { t } = useTranslation();

  const menus = useMemo<MenuItem[]>(() => {
    const baseMenus: MenuItem[] = [];

    if (onDetail) {
      baseMenus.push({
        icon: <InfoCircleOutlined />,
        text: t('contextMenu.detail'),
        onClick: () => onDetail(data),
      });
    }

    if (onOpen && !data.isDirectory) {
      baseMenus.push({
        icon: <EyeOutlined />,
        text: t('contextMenu.open'),
        onClick: () => onOpen(data),
      });
    }

    if (onDownload) {
      baseMenus.push({
        icon: <DownloadOutlined />,
        text: t('contextMenu.download'),
        onClick: () => onDownload(data),
      });
    }

    if (onCopy) {
      baseMenus.push({
        icon: <CopyOutlined />,
        text: t('contextMenu.copy'),
        onClick: () => onCopy(data),
      });
    }

    if (onCopyTo) {
      baseMenus.push({
        icon: <ExportOutlined />,
        text: t('contextMenu.copyTo'),
        onClick: () => onCopyTo(data),
      });
    }

    if (onMoveTo) {
      baseMenus.push({
        icon: <ScissorOutlined />,
        text: t('contextMenu.moveTo'),
        onClick: () => onMoveTo(data),
      });
    }

    if (onRename) {
      baseMenus.push({
        render: () => (
          <FileRenameWrap name={data.name as string} onRename={(newName: string) => onRename(data, newName)}>
            <Space size={8}>
              <EditOutlined />{t('contextMenu.rename')}
            </Space>
          </FileRenameWrap>
        ),
      });
    }

    if (onDelete) {
      baseMenus.push({
        render: () => (
          <FileDeteleWrap fileInfo={data} onDelete={onDelete}>
            <Space size={8}>
              <DeleteOutlined /> {t('contextMenu.delete')}
            </Space>
          </FileDeteleWrap>
        ),
      });
    }

    return baseMenus;
  }, [props, t]);

  return <ContextMenu menu={menus}>{children}</ContextMenu>;
};

export default FileContextMenu;
