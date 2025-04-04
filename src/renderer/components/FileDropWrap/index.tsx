import React, { useRef } from 'react';
import _ from 'lodash';
import './index.css';

export type FileDropWrapProps = {
  onDrop?: (v: string[]) => {};
  children: React.ReactNode;
};
const FileDropWrap = (props: FileDropWrapProps) => {
  const { children, onDrop } = props;
  const ref = useRef<any>(null);
  const handleOnDrop = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
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

  const handleOnDragover = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div ref={ref} id="dropzone" className="file-drop-wrap" onDragOver={handleOnDragover} onDrop={handleOnDrop}>
      {children}
    </div>
  );
};

export default FileDropWrap;
