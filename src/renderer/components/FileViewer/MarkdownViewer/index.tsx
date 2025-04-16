import { useState } from 'react';
import { Tooltip } from '@arco-design/web-react';
import { IconEye, IconEyeInvisible, IconCopy } from '@arco-design/web-react/icon';
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
            <Tooltip content="源文本">
              <div className="markdown-viewer-toolbar-item-btn" onClick={handlePreview}>
                <IconEyeInvisible />
              </div>
            </Tooltip>
          ) : (
            <Tooltip content="预览">
              <div className="markdown-viewer-toolbar-item-btn" onClick={handlePreview}>
                <IconEye />
              </div>
            </Tooltip>
          )}
          <Tooltip content="复制">
            <div className="markdown-viewer-toolbar-item-btn" onClick={handleCopy}>
              <IconCopy />
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
