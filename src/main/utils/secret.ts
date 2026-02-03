import { safeStorage, systemPreferences } from 'electron';
import CryptoJS from 'crypto-js';
import crypto from 'crypto';
import { machineIdSync } from 'node-machine-id';
import { errorLogger } from '@/main/utils/logger';

const VERSION = 'v1';
const VERSION_V2 = 'v2';
const ALG = 'aes-256-cbc';

const BASE_SECRET = Object.freeze(
  process.env.STORELINK_SECRET && process.env.STORELINK_SECRET.length >= 16
    ? process.env.STORELINK_SECRET
    : machineIdSync(),
);

// V1 (Legacy) Key Derivation
function deriveKey(secret: string, salt: CryptoJS.lib.WordArray) {
  const key = CryptoJS.PBKDF2(secret, salt, {
    keySize: 256 / 32,
    iterations: 150000,
  });
  return key;
}

// V2 (Native) Key Derivation
function deriveKeyV2(secret: string, salt: Buffer) {
  return crypto.pbkdf2Sync(secret, salt, 150000, 32, 'sha256');
}

export function encryptPassword(plain: string) {
  try {
    // Use V2 (Native Crypto) for new encryptions
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16);
    const key = deriveKeyV2(BASE_SECRET, salt);

    const cipher = crypto.createCipheriv(ALG, key, iv);
    let encrypted = cipher.update(plain, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const saltStr = salt.toString('base64');
    const ivStr = iv.toString('base64');

    return `enc:${VERSION_V2}:${ALG}:${saltStr}:${ivStr}:${encrypted}`;
  } catch (e: any) {
    errorLogger.error('Encrypt password failed:', e?.message || e);
    throw e;
  }
}

export function encryptPasswordWithSecret(secret: string, plain: string) {
  // Use V2 (Native Crypto)
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  const key = deriveKeyV2(secret, salt);

  const cipher = crypto.createCipheriv(ALG, key, iv);
  let encrypted = cipher.update(plain, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const saltStr = salt.toString('base64');
  const ivStr = iv.toString('base64');

  return `enc:${VERSION_V2}:${ALG}:${saltStr}:${ivStr}:${encrypted}`;
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

    if (alg !== ALG) throw new Error('Unsupported algorithm');

    if (ver === VERSION_V2) {
      // V2 Decryption (Native)
      const salt = Buffer.from(saltStr, 'base64');
      const iv = Buffer.from(ivStr, 'base64');
      const key = deriveKeyV2(BASE_SECRET, salt);

      const decipher = crypto.createDecipheriv(ALG, key, iv);
      let decrypted = decipher.update(ctStr, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } else if (ver === VERSION) {
      // V1 Decryption (Legacy)
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
    } else {
      throw new Error('Unsupported version');
    }
  } catch (e: any) {
    errorLogger.error('Decrypt password failed:', e?.message || e);
    throw e;
  }
}

export async function verifySystemAuth() {
  if (process.platform === 'darwin' && systemPreferences.canPromptTouchID()) {
    try {
      await systemPreferences.promptTouchID('允许 SynerStore 导出连接配置');
      return true;
    } catch (e) {
      errorLogger.error('Touch ID authentication failed:', e);
      throw new Error('User authentication failed');
    }
  }

  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('System encryption is not available');
  }

  try {
    const testString = 'auth_verification_check';
    const encrypted = safeStorage.encryptString(testString);
    const decrypted = safeStorage.decryptString(encrypted);

    if (decrypted !== testString) {
      throw new Error('Verification failed: decrypted value does not match');
    }
    return true;
  } catch (error) {
    errorLogger.error('System authentication failed:', error);
    throw new Error('System authentication failed');
  }
}

export function rotateSecret(newSecret: string) {
  if (!newSecret || newSecret.length < 16) {
    throw new Error('New secret is too short');
  }
  // 暴露给密钥轮换流程使用；调用方负责读取配置并重加密
  return Object.freeze(newSecret);
}
