import { getFiletype } from '@/utils';

import ExeIcon from '@/renderer/assets/file-icons/exe.png';
import Folder from '@/renderer/assets/file-icons/folder.png';
import ImageIcon from '@/renderer/assets/file-icons/png.png';
import PdfIcon from '@/renderer/assets/file-icons/pdf.png';
import MiscIcon from '@/renderer/assets/file-icons/misc.png';
import VideoIcon from '@/renderer/assets/file-icons/video.png';
import TextIcon from '@/renderer/assets/file-icons/text.png';
import ZipIcon from '@/renderer/assets/file-icons/zip.png';

export type FileIconProps = {
  type?: string;
  mime?: string;
  size?: 'small' | 'large';
};

const FileIcon = (props: FileIconProps) => {
  const { size = 'small' } = props;
  const type = props.type || getFiletype(props?.mime || '');

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return Folder;
      case 'image':
        return ImageIcon;
      case 'pdf':
        return PdfIcon;
      case 'exe':
        return ExeIcon;
      case 'video':
        return VideoIcon;
      case 'text':
        return TextIcon;
      case 'zip':
        return ZipIcon;
      default:
        return MiscIcon;
    }
  };

  return (
    <img
      // @ts-ignore
      style={{ height: size === 'small' ? 18 : 64, WebkitUserDrag: 'none' }}
      src={getFileIcon(type)}
      alt="File Icon"
    />
  );
};

export default FileIcon;
