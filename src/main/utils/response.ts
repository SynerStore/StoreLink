export const sucessResponse = (data: any, message?: string) => {
  return {
    code: 0,
    data,
    message: message || 'success',
    success: true,
  };
};

export const errorResponse = (message?: string) => {
  return {
    code: 1,
    data: null,
    message: message || 'error',
    success: false,
  };
};
