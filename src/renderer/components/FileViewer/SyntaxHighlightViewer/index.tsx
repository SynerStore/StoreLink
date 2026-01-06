// 语法高亮
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

import './index.css';

export type TxtViewerProps = {
  src: string;
  content?: string;
  mime?: string;
};

const SyntaxHighlightViewer = (props: TxtViewerProps) => {
  const { content } = props;

  const handleCopy = () => {
    navigator.clipboard.writeText(content as string);
  };

  return (
    <div className="syntax-highlight-viewer">
      <div className="syntax-highlight-viewer-toolbar">
        <div className="syntax-highlight-viewer-toolbar-item">
          <Tooltip title="复制">
            <div className="syntax-highlight-viewer-toolbar-item-btn" onClick={handleCopy}>
              <CopyOutlined />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="syntax-highlight-viewer-content">
        <SyntaxHighlighter
          language={'javascript'}
          showLineNumbers={true}
          wrapLongLines={true}
          wrapLines={true}
          lineProps={(lineNumber) => ({
            style: { display: 'block', cursor: 'pointer' },
          })}
        >
          {content as string}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default SyntaxHighlightViewer;
