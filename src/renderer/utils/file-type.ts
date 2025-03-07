export const getFiletype = (mine: string) => {
  switch (mine) {
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/png':
    case 'image/gif':
    case 'image/webp':
      return 'image';
    case 'video/mp4':
    case 'video/ogg':
    case 'video/webm':
    case 'video/x-msvideo':
    case 'video/x-ms-wmv':
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
      return 'text';
    default:
      return 'misc';
  }
};
