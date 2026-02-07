import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyObject, getSourceUrl } from '@/main/stores/adapters/cos/api';
import fs from 'fs-extra';
import mime from 'mime-types';

// Mock dependencies
vi.mock('cos-nodejs-sdk-v5');
vi.mock('fs-extra', async () => {
  const actual = await vi.importActual<typeof import('fs-extra')>('fs-extra');
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: vi.fn(),
      createWriteStream: vi.fn(),
      readFile: vi.fn(),
    },
    existsSync: vi.fn(),
    createWriteStream: vi.fn(),
    readFile: vi.fn(),
  };
});
vi.mock('mime-types', () => ({
  default: {
    lookup: vi.fn(),
  },
}));
vi.mock('@/main/utils/path', () => ({
  getTempPath: () => '/tmp',
  getUserDataPath: () => '/tmp',
}));

describe('COS API', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      putObjectCopy: vi.fn((params, cb) => cb(null, { ETag: 'test-etag' })),
      getObjectUrl: vi.fn((params, cb) => cb(null, { Url: 'http://test-url' })),
      headObject: vi.fn((params, cb) => cb(null, { ETag: '"test-etag"' })),
      getObject: vi.fn((params, cb) => cb(null, {})),
    };
  });

  describe('copyObject', () => {
    it('should format copySource correctly with leading slash', async () => {
      const params = {
        sourceKey: '/source/file.jpg',
        targetKey: 'target/file.jpg',
        bucketName: 'test-bucket',
        region: 'ap-guangzhou',
      };

      await copyObject(mockClient, params);

      expect(mockClient.putObjectCopy).toHaveBeenCalledWith(
        expect.objectContaining({
          CopySource: 'test-bucket.cos.ap-guangzhou.myqcloud.com/source/file.jpg',
        }),
        expect.any(Function)
      );
    });

    it('should format copySource correctly without leading slash', async () => {
      const params = {
        sourceKey: 'source/file.jpg',
        targetKey: 'target/file.jpg',
        bucketName: 'test-bucket',
        region: 'ap-guangzhou',
      };

      await copyObject(mockClient, params);

      expect(mockClient.putObjectCopy).toHaveBeenCalledWith(
        expect.objectContaining({
          CopySource: 'test-bucket.cos.ap-guangzhou.myqcloud.com/source/file.jpg',
        }),
        expect.any(Function)
      );
    });
  });

  describe('getSourceUrl', () => {
    it('should return URL directly for image', async () => {
      (mime.lookup as any).mockReturnValue('image/jpeg');

      const result = await getSourceUrl(mockClient, 'test-bucket', 'ap-guangzhou', 'test.jpg');

      expect(result).toEqual({
        src: 'http://test-url',
        mime: 'image/jpeg',
        content: '',
      });
      expect(mockClient.getObjectUrl).toHaveBeenCalled();
      expect(mockClient.getObject).not.toHaveBeenCalled();
    });

    it('should download file for text', async () => {
      (mime.lookup as any).mockReturnValue('text/plain');
      (fs.existsSync as any).mockReturnValue(false);
      (fs.createWriteStream as any).mockReturnValue({});
      (fs.readFile as any).mockResolvedValue('file content');

      const result = await getSourceUrl(mockClient, 'test-bucket', 'ap-guangzhou', 'test.txt');

      expect(mockClient.getObject).toHaveBeenCalled();
      expect(result.content).toBe('file content');
    });
  });
});
