export const getFiletype = (mine: string) => {
  switch (mine) {
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/png':
    case 'image/gif':
    case 'image/webp':
    case 'image/bmp':
    case 'image/tiff':
    case 'image/svg+xml':
    case 'image/vnd.adobe.photoshop':
      return 'image';
    case 'video/mp4':
    case 'video/ogg':
    case 'video/webm':
    case 'video/x-msvideo':
    case 'video/x-ms-wmv':
    case 'video/quicktime':
    case 'video/x-flv':
    case 'video/x-matroska':
      return 'video';
    case 'audio/mpeg':
    case 'audio/ogg':
    case 'audio/webm':
    case 'audio/x-ms-wma':
    case 'audio/x-ms-wax':
    case 'audio/x-wav':
      return 'audio';
    case 'application/pdf':
      return 'pdf';
    case 'application/json':
      return 'json';
    case 'text/javascript':
      return 'javascript';
    case 'text/css':
      return 'css';
    case 'text/plain':
    case 'text/csv':
    case 'text/html':
    case 'application/x-sql':
      return 'text';
    case 'text/markdown':
      return 'markdown';
    case 'application/zip':
    case 'application/x-bzip2':
      return 'zip';
    default:
      return 'misc';
  }
};
