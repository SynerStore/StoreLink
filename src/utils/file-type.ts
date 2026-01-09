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
    case 'application/javascript':
      return 'javascript';
    case 'text/css':
      return 'css';
    case 'text/plain':
    case 'text/csv':
    case 'text/html':
    case 'application/x-sql':
      return 'text';
    case 'text/yaml':
    case 'application/x-yaml':
      return 'yaml';
    case 'text/markdown':
      return 'markdown';
    case 'application/zip':
    case 'application/x-bzip2':
    case 'application/vnd.rar':
      return 'zip';
    case 'application/x-rar-compressed':
    case 'application/x-msdos-program':
      return 'exe';
    case 'application/x-apple-diskimage':
      return 'dmg';
    case 'application/vnd.android.package-archive':
      return 'apk';
    case 'application/octet-stream':
      return 'binary';
    default:
      return 'misc';
  }
};

// 支持获取文本内容的预览
export const isGetFileContent = (mime: string) => {
  const fileType = getFiletype(mime);
  const supportedTypes = ['text', 'javascript', 'css', 'markdown'];
  return supportedTypes.includes(fileType);
};

// 支持打开的文件类型
export const isCanOpenFile = (mime: string) => {
  const fileType = getFiletype(mime);
  const supportedTypes = ['text', 'javascript', 'json', 'css', 'markdown', 'image', 'pdf', 'video', 'audio'];
  return supportedTypes.includes(fileType);
};
