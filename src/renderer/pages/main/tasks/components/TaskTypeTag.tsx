import React from 'react';
import { Tag } from 'antd';
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  FolderAddOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ETaskType } from '@/types';

interface TaskTypeTagProps {
  type: ETaskType;
}

const TaskTypeTag: React.FC<TaskTypeTagProps> = ({ type }) => {
  const { t } = useTranslation();

  const getTagProps = (type: ETaskType) => {
    switch (type) {
      case ETaskType.UPLOAD:
        return { color: 'blue', icon: <CloudUploadOutlined /> };
      case ETaskType.DOWNLOAD:
        return { color: 'green', icon: <CloudDownloadOutlined /> };
      case ETaskType.DELETE:
        return { color: 'red', icon: <DeleteOutlined /> };
      case ETaskType.RENAME:
        return { color: 'orange', icon: <EditOutlined /> };
      case ETaskType.COPY:
        return { color: 'cyan', icon: <CopyOutlined /> };
      case ETaskType.CREATE_DIR:
        return { color: 'purple', icon: <FolderAddOutlined /> };
      case ETaskType.TRANSFER:
        return { color: 'geekblue', icon: <SwapOutlined /> };
      default:
        return { color: 'default', icon: undefined };
    }
  };

  const { color, icon } = getTagProps(type);

  return (
    <Tag color={color} icon={icon} aria-label={t(`tasks.type.${type}`)}>
      {t(`tasks.type.${type}`)}
    </Tag>
  );
};

export default TaskTypeTag;
