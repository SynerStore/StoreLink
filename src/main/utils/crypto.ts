import CryptoJS from 'crypto-js';

export function getMd5ByString(str: string) {
  const result = CryptoJS.MD5(str).toString();
  return result;
}
