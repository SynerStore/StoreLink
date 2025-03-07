const createOssId = (data: Record<string, any>) => {
  return Object.keys(data)
    .map((key) => {
      return `${data[key]}`;
    })
    .join('_');
};

export const getIdByConfig = (config: Record<string, any>) => {
  switch (config.type) {
    case 'oss':
      return createOssId(config.authInfo);

    default:
      return '';
  }
};
