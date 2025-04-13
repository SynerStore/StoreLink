import { useRef, useState, useMemo } from 'react';
import { Tooltip } from '@arco-design/web-react';
import {
  IconRotateLeft,
  IconRotateRight,
  IconZoomIn,
  IconZoomOut,
  IconOriginalSize,
} from '@arco-design/web-react/icon';

import { PreviewScales, defaultScales } from '@/renderer/utils';
import './index.css';

export type ImageViewerProps = {
  src: string;
  content?: string;
  mime?: string;
};
const ImageViewer = (props: ImageViewerProps) => {
  const { src } = props;
  const refImage = useRef<any>();
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(1);
  const ROTATE_STEP = 90;

  const previewScales = useMemo(() => {
    return new PreviewScales(defaultScales);
  }, []);

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

  const defaultActions = [
    {
      key: 'rotateRight',
      name: '向右旋转',
      content: <IconRotateRight />,
      onClick: onRotateRight,
    },
    {
      key: 'rotateLeft',
      name: '向左旋转',
      content: <IconRotateLeft />,
      onClick: onRotateLeft,
    },
    {
      key: 'zoomIn',
      name: '放大',
      content: <IconZoomIn />,
      onClick: onZoomIn,
      disabled: scale === previewScales.maxScale,
    },
    {
      key: 'zoomOut',
      name: '缩小',
      content: <IconZoomOut />,
      onClick: onZoomOut,
      disabled: scale === previewScales.minScale,
    },
    {
      key: 'originalSize',
      name: '原始尺寸',
      content: <IconOriginalSize />,
      onClick: onResetScale,
    },
  ];
  return (
    <div className="image-viewer">
      <img
        className="image-viewer-img"
        ref={refImage}
        style={{
          transform: `rotate(${rotate}deg) scale(${scale}, ${scale})`,
        }}
        src={src}
      />
      <div className="image-viewer-toolbar">
        <div className="image-viewer-toolbar-item">
          {defaultActions.map((item) => {
            return (
              <Tooltip key={item.key} content={item.name}>
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
