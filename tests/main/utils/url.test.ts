import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isCanAccessUrl } from '@/main/utils/url';
import http from 'node:http';
import https from 'node:https';
import { EventEmitter } from 'events';

// Mock logger to avoid polluting test output
vi.mock('@/main/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('isCanAccessUrl', () => {
  const testUrl = 'https://example.com';
  let requestSpy: any;

  beforeEach(() => {
    // Mock https.request (since testUrl is https)
    requestSpy = vi.spyOn(https, 'request');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockRequest = (statusCode: number = 200, error: Error | null = null, headers: any = {}) => {
    return requestSpy.mockImplementation((url: any, options: any, callback: any) => {
      const req = new EventEmitter() as any;
      req.end = vi.fn();
      req.destroy = vi.fn();

      if (error) {
        // Use setImmediate to simulate async nature
        setImmediate(() => {
          req.emit('error', error);
        });
      } else {
        setImmediate(() => {
          const res = new EventEmitter() as any;
          res.statusCode = statusCode;
          res.headers = headers;
          res.resume = vi.fn();
          if (callback) callback(res);
        });
      }
      return req;
    });
  };

  it('should return true for accessible url (200)', async () => {
    mockRequest(200);
    const result = await isCanAccessUrl(testUrl);
    expect(result).toBe(true);
    expect(requestSpy).toHaveBeenCalledWith(
      testUrl,
      expect.objectContaining({ method: 'HEAD' }),
      expect.any(Function)
    );
  });

  it('should return false for 404', async () => {
    mockRequest(404);
    const result = await isCanAccessUrl(testUrl);
    expect(result).toBe(false);
  });

  it('should return false for 500', async () => {
    mockRequest(500);
    const result = await isCanAccessUrl(testUrl);
    expect(result).toBe(false);
  });

  it('should retry on network error and return false if all fail', async () => {
    mockRequest(0, new Error('Network Error'));
    const result = await isCanAccessUrl(testUrl);
    expect(result).toBe(false);
    expect(requestSpy).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should return true if retry succeeds', async () => {
    // Mock implementations sequentially
    let callCount = 0;
    requestSpy.mockImplementation((url: any, options: any, callback: any) => {
      const req = new EventEmitter() as any;
      req.end = vi.fn();
      req.destroy = vi.fn();
      
      callCount++;
      if (callCount <= 2) {
        setImmediate(() => req.emit('error', new Error('Fail')));
      } else {
        setImmediate(() => {
          const res = new EventEmitter() as any;
          res.statusCode = 200;
          res.headers = {};
          res.resume = vi.fn();
          if (callback) callback(res);
        });
      }
      return req;
    });
      
    const result = await isCanAccessUrl(testUrl);
    expect(result).toBe(true);
    expect(requestSpy).toHaveBeenCalledTimes(3);
  });

  it('should try GET if HEAD returns 405', async () => {
    requestSpy.mockImplementation((url: any, options: any, callback: any) => {
      const req = new EventEmitter() as any;
      req.end = vi.fn();
      req.destroy = vi.fn();
      
      setImmediate(() => {
        const res = new EventEmitter() as any;
        res.statusCode = options.method === 'HEAD' ? 405 : 200;
        res.headers = {};
        res.resume = vi.fn();
        if (callback) callback(res);
      });
      return req;
    });

    const result = await isCanAccessUrl(testUrl);
    expect(result).toBe(true);
    expect(requestSpy).toHaveBeenCalledTimes(2);
    expect(requestSpy).toHaveBeenNthCalledWith(1, testUrl, expect.objectContaining({ method: 'HEAD' }), expect.any(Function));
    expect(requestSpy).toHaveBeenNthCalledWith(2, testUrl, expect.objectContaining({ method: 'GET' }), expect.any(Function));
  });

  it('should try GET if HEAD returns 403 (Forbidden)', async () => {
    requestSpy.mockImplementation((url: any, options: any, callback: any) => {
      const req = new EventEmitter() as any;
      req.end = vi.fn();
      req.destroy = vi.fn();
      
      setImmediate(() => {
        const res = new EventEmitter() as any;
        res.statusCode = options.method === 'HEAD' ? 403 : 200;
        res.headers = {};
        res.resume = vi.fn();
        if (callback) callback(res);
      });
      return req;
    });

    const result = await isCanAccessUrl(testUrl);
    expect(result).toBe(true);
    expect(requestSpy).toHaveBeenCalledTimes(2);
    expect(requestSpy).toHaveBeenNthCalledWith(1, testUrl, expect.objectContaining({ method: 'HEAD' }), expect.any(Function));
    expect(requestSpy).toHaveBeenNthCalledWith(2, testUrl, expect.objectContaining({ method: 'GET' }), expect.any(Function));
  });
  
  it('should follow redirects', async () => {
    const redirectUrl = 'https://redirect.com';
    const targetUrl = 'https://target.com';
    
    requestSpy.mockImplementation((url: any, options: any, callback: any) => {
      const req = new EventEmitter() as any;
      req.end = vi.fn();
      req.destroy = vi.fn();
      
      setImmediate(() => {
        const res = new EventEmitter() as any;
        res.resume = vi.fn();
        
        if (url === redirectUrl) {
           res.statusCode = 301;
           res.headers = { location: targetUrl };
        } else {
           res.statusCode = 200;
           res.headers = {};
        }
        
        if (callback) callback(res);
      });
      return req;
    });
    
    const result = await isCanAccessUrl(redirectUrl);
    expect(result).toBe(true);
  });
  
  it('should return false for invalid url format', async () => {
    const result = await isCanAccessUrl('invalid-url');
    expect(result).toBe(false);
  });
});
