import { describe, it, expect } from 'vitest';
import { isEmpty, runTasksSequentially, sleep } from '@/main/utils/helpers';

describe('helpers utils', () => {
  describe('isEmpty', () => {
    it('should return true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('should return true for whitespace string', () => {
        // Based on implementation: typeof value === 'string' && value.trim() === ''
        expect(isEmpty('   ')).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(123)).toBe(false);
    });

    it('should return false for non-empty array', () => {
      expect(isEmpty([1, 2])).toBe(false);
    });

    it('should return false for non-empty object', () => {
        expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('runTasksSequentially', () => {
      it('should run tasks in order and return results', async () => {
          const task1 = Promise.resolve(1);
          const task2 = Promise.resolve(2);
          const results = await runTasksSequentially([task1, task2]);
          expect(results).toEqual([1, 2]);
      });

      it('should handle errors', async () => {
          const task1 = Promise.resolve(1);
          const task2 = Promise.reject(new Error('fail'));
          await expect(runTasksSequentially([task1, task2])).rejects.toThrow('fail');
      });
  });

  describe('sleep', () => {
    it('should wait for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(95); // Allow small margin
    });

    it('should wait until condition is met', async () => {
      let flag = false;
      setTimeout(() => { flag = true; }, 100);

      const start = Date.now();
      await sleep(10, () => flag);
      const end = Date.now();

      expect(flag).toBe(true);
      expect(end - start).toBeGreaterThanOrEqual(95);
    });
  });
});
