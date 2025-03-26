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
    if (event.dataTransfer.files.length !== 0) {
      for (const file of event.dataTransfer.files) {
        const filePath = window.electronBridge.getPathForFile(file);
        filePaths.push(filePath);
      }
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
