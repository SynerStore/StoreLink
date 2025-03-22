export type ResponseData<T> = {
  code: 0 | 1;
  data: T;
  message: string;
  success: boolean;
};

export const sucessResponse = (data: any, message?: string): ResponseData<any> => {
  return {
    code: 0,
    data,
    message: message || 'success',
    success: true,
  };
};

export const errorResponse = (message?: string): ResponseData<null> => {
  return {
    code: 1,
    data: null,
    message: message || 'error',
    success: false,
  };
};
