import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudUploadOutlined } from '@ant-design/icons';
import _ from 'lodash';
import './index.css';

export type FileDropWrapProps = {
  onDrop?: (v: string[]) => {};
  children: React.ReactNode;
};
const FileDropWrap = (props: FileDropWrapProps) => {
  const { children, onDrop } = props;
  const ref = useRef<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { t } = useTranslation();

  const handleOnDrop = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    setIsDragOver(false);

    const filePaths = [];
    // 本地文件拖拽
    if (event.dataTransfer.files.length !== 0) {
      for (const file of event.dataTransfer.files) {
        const filePath = window.electronBridge.getPathForFile(file);
        filePaths.push(filePath);
      }
    }
    // 分栏文件拖拽
    else if (event.dataTransfer.dropEffect === 'copy') {
      // 判断是否是子元素，是子元素则不生效
      const dataInfo = event.dataTransfer.getData('application/json');
      console.log('文件拖拽信息', dataInfo);
    }

    if (onDrop) onDrop(filePaths);
  };

  const handleOnDragEnter = (event: any) => {
    event.stopPropagation();
    event.preventDefault();

    // 检查是否是从外部拖入的文件（本地文件系统）
    // 如果有 files 且长度大于 0，说明是从外部拖入的文件
    // 如果 dropEffect 是 copy 且有 application/json 数据，说明是内部拖拽
    const hasExternalFiles = event.dataTransfer.types.includes('Files') && event.dataTransfer.items.length > 0;
    const isInternalDrag = event.dataTransfer.dropEffect === 'copy' || event.dataTransfer.types.includes('application/json');

    // 只有从外部拖入文件时才显示上传框
    if (hasExternalFiles && !isInternalDrag) {
      setIsDragOver(true);
    }
  };

  const handleOnDragLeave = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    // 只有当离开整个容器时才取消高亮
    if (ref.current && !ref.current.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleOnDragOver = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div 
      ref={ref} 
      id="dropzone" 
      className={`file-drop-wrap ${isDragOver ? 'drag-over' : ''}`}
      onDragEnter={handleOnDragEnter}
      onDragLeave={handleOnDragLeave}
      onDragOver={handleOnDragOver} 
      onDrop={handleOnDrop}
    >
      {children}
      {isDragOver && (
        <div className="file-drop-overlay">
          <div className="file-drop-content">
            <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div className="file-drop-text">{t('common.upload', 'Upload')}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropWrap;
