import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import CosStore from '@/main/stores/adapters/cos';
import OssStore from '@/main/stores/adapters/oss';
import S3Store from '@/main/stores/adapters/s3';
import { StoreTypes } from '@/types';

vi.mock('@/main/db', () => ({
  getConnectionById: vi.fn(),
}));

vi.mock('@/main/tasks/manage', () => ({
  default: {
    getInstance: vi.fn(() => ({ getTasks: vi.fn(() => ({ list: [] })) })),
  },
}));

let storeConnect: typeof import('@/main/stores/storeManage').storeConnect;

const loadTestEnv = () => {
  for (const fileName of ['.env', '.env.test']) {
    const filePath = path.resolve(process.cwd(), fileName);
    if (existsSync(filePath)) {
      loadEnvFile(filePath);
    }
  }
};

loadTestEnv();

const hasEnv = (...keys: string[]) => keys.every((key) => Boolean(process.env[key]));
const envValue = (key: string) => process.env[key];
const shouldRun = process.env.RUN_STORAGE_INTEGRATION_TESTS === 'true';
const ossConfig = () => {
  const bucketName = envValue('OSS_ACCESS_BUCKET') || envValue('OSS_BUCKET');
  const region = envValue('OSS_REGION');
  return {
    accessKeyId: envValue('OSS_ACCESS_KEY_ID'),
    secretAccessKey: envValue('OSS_ACCESS_KEY_SECRET'),
    ...(bucketName && region ? { bucketName, region } : {}),
  };
};
const cosConfig = () => {
  const bucketName = envValue('COS_ACCESS_BUCKET') || envValue('COS_BUCKET');
  const region = envValue('COS_REGION');
  return {
    accessKeyId: envValue('COS_ACCESS_KEY_ID'),
    secretAccessKey: envValue('COS_ACCESS_KEY_SECRET'),
    ...(bucketName && region ? { bucketName, region } : {}),
  };
};
const s3Config = () => ({
  accessKeyId: envValue('S3_ACCESS_KEY_ID'),
  secretAccessKey: envValue('S3_ACCESS_KEY_SECRET'),
  region: envValue('S3_REGION'),
  endpoint: envValue('S3_ENDPOINT') || undefined,
  bucketName: envValue('S3_ACCESS_BUCKET') || envValue('S3_BUCKET') || undefined,
});

describe.runIf(shouldRun)('Storage connection', () => {
  const stores: Array<{ destroy?: () => void }> = [];

  beforeAll(async () => {
    ({ storeConnect } = await import('@/main/stores/storeManage'));
  });

  afterEach(() => {
    while (stores.length) {
      stores.pop()?.destroy?.();
    }
  });

  it.runIf(hasEnv('OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET'))('connects to Aliyun OSS', async () => {
    const store = new OssStore('storage-test-oss', ossConfig());
    stores.push(store);

    const result = await store.test();

    expect(result.success, result.message).toBe(true);
  });

  it.runIf(hasEnv('COS_ACCESS_KEY_ID', 'COS_ACCESS_KEY_SECRET'))('connects to Tencent Cloud COS', async () => {
    const store = new CosStore('storage-test-cos', cosConfig());
    stores.push(store);

    const result = await store.test();

    expect(result.success, result.message).toBe(true);
  });

  it.runIf(hasEnv('S3_ACCESS_KEY_ID', 'S3_ACCESS_KEY_SECRET', 'S3_REGION'))(
    'connects to S3-compatible storage',
    async () => {
      const store = new S3Store('storage-test-s3', s3Config());
      stores.push(store);

      const result = await store.test();

      expect(result.success, result.message).toBe(true);
    },
  );

  describe('storeConnect entry', () => {
    it.runIf(hasEnv('OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET'))('connects to Aliyun OSS', async () => {
      const result = await storeConnect({
        id: 'storage-test-oss-store-connect',
        type: StoreTypes.OSS,
        config: ossConfig(),
      });

      expect(result).toMatchObject({ success: true, code: 0 });
    });

    it.runIf(hasEnv('COS_ACCESS_KEY_ID', 'COS_ACCESS_KEY_SECRET'))('connects to Tencent Cloud COS', async () => {
      const result = await storeConnect({
        id: 'storage-test-cos-store-connect',
        type: StoreTypes.COS,
        config: cosConfig(),
      });

      expect(result).toMatchObject({ success: true, code: 0 });
    });

    it.runIf(hasEnv('S3_ACCESS_KEY_ID', 'S3_ACCESS_KEY_SECRET', 'S3_REGION'))(
      'connects to S3-compatible storage',
      async () => {
        const result = await storeConnect({
          id: 'storage-test-s3-store-connect',
          type: StoreTypes.S3,
          config: s3Config(),
        });

        expect(result).toMatchObject({ success: true, code: 0 });
      },
    );
  });
});
