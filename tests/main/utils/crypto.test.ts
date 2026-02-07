import { describe, it, expect } from 'vitest';
import { getMd5ByString } from '@/main/utils/crypto';

describe('crypto utils', () => {
  it('getMd5ByString should return correct MD5 hash', () => {
    const input = 'hello world';
    const expected = '5eb63bbbe01eeed093cb22bb8f5acdc3';
    expect(getMd5ByString(input)).toBe(expected);
  });
});
