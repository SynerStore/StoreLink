import { Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import './index.css';

export type TxtViewerProps = {
  src: string;
  content?: string;
  mime?: string;
};

const TxtViewer = (props: TxtViewerProps) => {
  const { t } = useTranslation();
  const { content } = props;
  const handleCopy = () => {
    navigator.clipboard.writeText(content as string);
  };

  return (
    <div className="txt-viewer">
      <div className="txt-viewer-toolbar">
        <div className="txt-viewer-toolbar-item">
          <Tooltip title={t('common.copy')}>
            <div className="txt-viewer-toolbar-item-btn" onClick={handleCopy}>
              <CopyOutlined />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="txt-viewer-content">
        <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{content}</pre>
      </div>
    </div>
  );
};
export default TxtViewer;
