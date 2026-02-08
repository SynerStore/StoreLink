import React, { useMemo, useState } from 'react';
import { Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      case 'yaml':
      case 'json':
        return SyntaxHighlightViewer;
      case 'markdown':
        return MarkdownViewer;
      default:
        return null;
    }
  }, [type]);

  if (loading) {
    if (type === 'image') {
      return (
        <div className="file-viewer-skeleton center">
          <Skeleton.Image active className="image-skeleton-item" />
        </div>
      );
    }
    return (
      <div className="file-viewer-skeleton padding">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return ViewerComponent ? (
    React.createElement(ViewerComponent as any, {
      id: props.id,
      src: sourceUrl,
      content: content,
      mime: props?.mime,
    })
  ) : (
    <div className="file-viewer-unsupported"> {t('fileViewer.unsupportedFile')}</div>
  );
};

export default FileViewer;
