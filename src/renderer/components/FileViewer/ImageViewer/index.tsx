import { useRef, useState, useMemo, useEffect } from 'react';
import { Tooltip, App, Spin } from 'antd';
import {
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import heic2any from 'heic2any';

import { events, downloadViewerSource } from '@/renderer/utils';
import { PreviewScales, defaultScales } from '@/renderer/utils';
import './index.css';

export type ImageViewerProps = {
  id: string;
  src: string;
  content?: string;
  mime?: string;
};
const ImageViewer = (props: ImageViewerProps) => {
  const { id, src, mime, content } = props;
  const refImage = useRef<any>();
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(1);
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { message } = App.useApp();
  const ROTATE_STEP = 90;

  const previewScales = useMemo(() => {
    return new PreviewScales(defaultScales);
  }, []);

  useEffect(() => {
    if (!src && !content) return;
    let objectUrl = '';
    const loadHeic = async () => {
      const isHeic = mime === 'image/heic' || src.toLowerCase().endsWith('.heic');

      if (isHeic) {
        try {
          setLoading(true);
          let blob: Blob;

          if (content && content.startsWith('data:')) {
            // 使用 base64 content
            const res = await fetch(content);
            blob = await res.blob();
          } else {
            // 使用 fetch 读取 blob (对于 file:// 协议)
            // 注意：如果之前修改为 XHR，这里保留 XHR 或 fetch 取决于具体环境支持
            // 由于主进程现在可能返回 content (base64)，优先使用 content
            const res = await fetch(src);
            blob = await res.blob();
          }

          const conversionResult = await heic2any({
            blob,
            toType: 'image/jpeg',
            quality: 0.8,
          });

          const resultBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
          objectUrl = URL.createObjectURL(resultBlob);
          setImgSrc(objectUrl);
        } catch (error) {
          console.error('HEIC conversion failed:', error);
          message.error('HEIC preview failed, showing original');
          setImgSrc(src);
        } finally {
          setLoading(false);
        }
      } else {
        setImgSrc(src);
        setLoading(false);
      }
    };

    loadHeic();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, mime, content]);

  const onRotateRight = () => {
    setRotate((rotate + ROTATE_STEP) % 360);
  };

  const onRotateLeft = () => {
    setRotate(rotate === 0 ? 360 - ROTATE_STEP : rotate - ROTATE_STEP);
  };

  const onZoomIn = () => {
    const newScale = previewScales.getNextScale(scale, 'zoomIn');
    onScaleChange(newScale);
  };

  const onZoomOut = () => {
    const newScale = previewScales.getNextScale(scale, 'zoomOut');
    onScaleChange(newScale);
  };

  const onResetScale = () => {
    onScaleChange(1);
  };

  const onScaleChange = (newScale: number) => {
    if (scale !== newScale) {
      setScale(newScale);
    }
  };

  const onDownload = async () => {
    if (!src) return;
    const localDir = await events.getSingleDirPath({});
    if (!localDir) return;
    await downloadViewerSource(id, { src, localPath: localDir });
    message.success(t('fileViewer.downloadStarted'));
  };

  const defaultActions = [
    {
      key: 'rotateRight',
      name: t('fileViewer.imageViewer.rotateRight'),
      content: <RotateRightOutlined />,
      onClick: onRotateRight,
    },
    {
      key: 'rotateLeft',
      name: t('fileViewer.imageViewer.rotateLeft'),
      content: <RotateLeftOutlined />,
      onClick: onRotateLeft,
    },
    {
      key: 'zoomIn',
      name: t('fileViewer.imageViewer.zoomIn'),
      content: <ZoomInOutlined />,
      onClick: onZoomIn,
      disabled: scale === previewScales.maxScale,
    },
    {
      key: 'zoomOut',
      name: t('fileViewer.imageViewer.zoomOut'),
      content: <ZoomOutOutlined />,
      onClick: onZoomOut,
      disabled: scale === previewScales.minScale,
    },
    {
      key: 'originalSize',
      name: t('fileViewer.imageViewer.originalSize'),
      content: <ExpandOutlined />,
      onClick: onResetScale,
    },
    {
      key: 'download',
      name: t('common.download'),
      content: <DownloadOutlined />,
      onClick: onDownload,
    },
  ];
  return (
    <div className="image-viewer">
      {loading && <Spin size="large" style={{ position: 'absolute', zIndex: 10 }} />}
      <img
        className="image-viewer-img"
        ref={refImage}
        style={{
          transform: `rotate(${rotate}deg) scale(${scale}, ${scale})`,
          opacity: loading ? 0 : 1,
        }}
        src={imgSrc}
      />
      <div className="image-viewer-toolbar">
        <div className="image-viewer-toolbar-item">
          {defaultActions.map((item) => {
            return (
              <Tooltip key={item.key} title={item.name}>
                <div className="image-viewer-toolbar-item-btn" onClick={item.onClick}>
                  {item.content}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default ImageViewer;
