import { getFiletype } from '../../utils';

import ExeIcon from '../../assets/file-icons/exe.png';
import Folder from '../../assets/file-icons/folder.png';
import ImageIcon from '../../assets/file-icons/jpg.png';
import PdfIcon from '../../assets/file-icons/pdf.png';
import MiscIcon from '../../assets/file-icons/misc.png';

export type FileIconProps = {
  type?: string;
  mime?: string;
};

const FileIcon = (props: FileIconProps) => {
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
      default:
        return MiscIcon;
    }
  };

  return <img style={{ height: 16 }} src={getFileIcon(type)} alt="File Icon" />;
};

export default FileIcon;
