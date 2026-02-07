import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import os from 'node:os';
import { getSourceUrl } from '@/main/stores/adapters/local/api';

describe('Local Store API', () => {
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'synerstore-test-'));
  });

  afterAll(async () => {
    await fs.remove(tempDir);
  });

  describe('getSourceUrl', () => {
    it('should return file protocol url and content for text file', async () => {
      const filePath = path.join(tempDir, 'test.txt');
      const content = 'Hello World';
      await fs.writeFile(filePath, content);

      const result = await getSourceUrl({ key: filePath });
      // pathToFileURL produces file:///path/to/file (3 slashes on unix-like if absolute)
      // path.join(os.tmpdir()) usually returns absolute path
      const expectedUrl = `file://${filePath}`;
      expect(result.src).toBe(expectedUrl);
      expect(result.mime).toBe('text/plain');
      expect(result.content).toBe(content);
    });

    it('should handle spaces in path', async () => {
      const filePath = path.join(tempDir, 'file with spaces.txt');
      await fs.writeFile(filePath, 'content');

      const result = await getSourceUrl({ key: filePath });
      expect(result.src).toContain('file://');
      expect(result.src).toContain('file%20with%20spaces.txt');
    });
  });
});
