import React, { useMemo, useState } from 'react';
import { Spin } from '@arco-design/web-react';

import MarkdownViewer from './MarkdownViewer';
import PdfViewer from './PdfViewer';
import TxtViewer from './TxtViewer';
import VideoViewer from './VideoViewer';
import ImageViewer from './ImageViewer';
import SyntaxHighlightViewer from './SyntaxHighlightViewer';
import { getViewerSource } from '@/renderer/utils';
import { getFiletype } from '@/utils';
import { useLoading, useEffectOnce } from '@/renderer/hooks';
import './index.css';

export type FileViewerProps = {
  mime: string;
  id: string;
};
const FileViewer = (props: FileViewerProps) => {
  const { loading, setLoading } = useLoading();
  const [sourceUrl, setSourceUrl] = useState('');
  const [content, setContent] = useState('');
  const type = getFiletype(props?.mime || '');

  const handleGetViewerSource = async () => {
    setLoading(true);
    const { src, content } = await getViewerSource(props.id);
    setSourceUrl(src);
    setContent(content);
    setLoading(false);
  };

  useEffectOnce(() => {
    handleGetViewerSource();
  }, []);

  const ViewerComponent = useMemo(() => {
    switch (type) {
      case 'image':
        return ImageViewer;
      case 'pdf':
        return PdfViewer;
      case 'video':
        return VideoViewer;
      case 'text':
        return TxtViewer;
      case 'javascript':
      case 'css':
        return SyntaxHighlightViewer;
      case 'markdown':
        return MarkdownViewer;
      default:
        return null;
    }
  }, [type]);

  return (
    <Spin className="file-viewer-spin" dot loading={loading} tip="资源加载中，请耐心等待...">
      {ViewerComponent ? (
        React.createElement(ViewerComponent as any, { id: props.id, src: sourceUrl, content: content, mime: props?.mime })
      ) : (
        <div> 该文档无法查看</div>
      )}
    </Spin>
  );
};

export default FileViewer;
