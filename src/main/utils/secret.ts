import CryptoJS from 'crypto-js';
import { machineIdSync } from 'node-machine-id';
import { errorLogger } from '@/main/utils/logger';

const VERSION = 'v1';
const ALG = 'aes-256-cbc';

const BASE_SECRET = Object.freeze(
  process.env.STORELINK_SECRET && process.env.STORELINK_SECRET.length >= 16
    ? process.env.STORELINK_SECRET
    : machineIdSync(),
);

function deriveKey(secret: string, salt: CryptoJS.lib.WordArray) {
  const key = CryptoJS.PBKDF2(secret, salt, {
    keySize: 256 / 32,
    iterations: 150000,
  });
  return key;
}

export function encryptPassword(plain: string) {
  try {
    const salt = CryptoJS.lib.WordArray.random(16);
    const iv = CryptoJS.lib.WordArray.random(16);
    const key = deriveKey(BASE_SECRET, salt);
    const cipher = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plain), key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const ct = cipher.ciphertext.toString(CryptoJS.enc.Base64);
    const saltStr = salt.toString(CryptoJS.enc.Base64);
    const ivStr = iv.toString(CryptoJS.enc.Base64);
    return `enc:${VERSION}:${ALG}:${saltStr}:${ivStr}:${ct}`;
  } catch (e: any) {
    errorLogger.error('Encrypt password failed:', e?.message || e);
    throw e;
  }
}

export function encryptPasswordWithSecret(secret: string, plain: string) {
  const salt = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);
  const key = deriveKey(secret, salt);
  const cipher = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plain), key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const ct = cipher.ciphertext.toString(CryptoJS.enc.Base64);
  const saltStr = salt.toString(CryptoJS.enc.Base64);
  const ivStr = iv.toString(CryptoJS.enc.Base64);
  return `enc:${VERSION}:${ALG}:${saltStr}:${ivStr}:${ct}`;
}

export function isEncrypted(value: any) {
  return typeof value === 'string' && value.startsWith('enc:');
}

export function decryptPassword(enc: string) {
  try {
    if (!isEncrypted(enc)) return enc;
    const parts = enc.split(':');
    if (parts.length !== 6) throw new Error('Invalid encrypted format');
    const [_enc, ver, alg, saltStr, ivStr, ctStr] = parts;
    if (ver !== VERSION || alg !== ALG) throw new Error('Unsupported crypto version or algorithm');
    const salt = CryptoJS.enc.Base64.parse(saltStr);
    const iv = CryptoJS.enc.Base64.parse(ivStr);
    const ct = CryptoJS.enc.Base64.parse(ctStr);
    const key = deriveKey(BASE_SECRET, salt);
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: ct } as any, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const text = decrypted.toString(CryptoJS.enc.Utf8);
    if (!text) throw new Error('Decryption produced empty result');
    return text;
  } catch (e: any) {
    errorLogger.error('Decrypt password failed:', e?.message || e);
    throw e;
  }
}

export function rotateSecret(newSecret: string) {
  if (!newSecret || newSecret.length < 16) {
    throw new Error('New secret is too short');
  }
  // 暴露给密钥轮换流程使用；调用方负责读取配置并重加密
  return Object.freeze(newSecret);
}
