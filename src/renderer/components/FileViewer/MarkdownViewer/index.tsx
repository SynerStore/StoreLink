import { useState } from 'react';
import { Tooltip } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, CopyOutlined } from '@ant-design/icons';
import MarkdownPreview from '@uiw/react-markdown-preview';

import './index.css';

export type MarkdownViewerProps = {
  src: string;
  content?: string;
  mime?: string;
};
const MarkdownViewer = (props: MarkdownViewerProps) => {
  const { content } = props;
  const [isMd, setIsMd] = useState(true);

  const handlePreview = () => {
    setIsMd(!isMd);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content as string);
  };

  return (
    <div className="markdown-viewer">
      <div className="markdown-viewer-toolbar">
        <div className="markdown-viewer-toolbar-item">
          {isMd ? (
            <Tooltip title="源文本">
              <div className="markdown-viewer-toolbar-item-btn" onClick={handlePreview}>
                <EyeInvisibleOutlined />
              </div>
            </Tooltip>
          ) : (
            <Tooltip title="预览">
              <div className="markdown-viewer-toolbar-item-btn" onClick={handlePreview}>
                <EyeOutlined />
              </div>
            </Tooltip>
          )}
          <Tooltip title="复制">
            <div className="markdown-viewer-toolbar-item-btn" onClick={handleCopy}>
              <CopyOutlined />
            </div>
          </Tooltip>
        </div>
      </div>
      {/* @ts-ignore  */}
      <div className="markdown-viewer-content">
        {isMd ? (
          <MarkdownPreview source={content} />
        ) : (
          <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{content}</pre>
        )}
      </div>
    </div>
  );
};
export default MarkdownViewer;
