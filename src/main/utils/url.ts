import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';
import { logger } from './logger';

/**
 * 判断当前 url 是否可以直接访问并返回内容
 * Check if the URL is accessible via HTTP HEAD/GET request.
 *
 * @param {string} url - The URL to check.
 * @returns {Promise<boolean>} - Returns true if the URL returns a 2xx or 3xx status code, false otherwise.
 */
export async function isCanAccessUrl(urlStr: string): Promise<boolean> {
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 10000; // 10 seconds
  const MAX_REDIRECTS = 5;

  const doRequest = (currentUrl: string, method: 'HEAD' | 'GET', redirectCount = 0): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (redirectCount > MAX_REDIRECTS) {
        reject(new Error('Too many redirects'));
        return;
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(currentUrl);
      } catch (e) {
        reject(e);
        return;
      }

      const lib = parsedUrl.protocol === 'https:' ? https : http;
      const request = lib.request(
        currentUrl,
        {
          method,
          timeout: TIMEOUT_MS,
          headers: {
            'User-Agent': 'SynerStoreClient/1.0.0', // Good practice
          },
        },
        (res) => {
          // Consume data to free memory
          res.resume();

          const statusCode = res.statusCode || 0;

          // Handle redirects (301, 302, 303, 307, 308)
          if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
            const nextUrl = new URL(res.headers.location, currentUrl).href;
            // Recursively follow redirect
            doRequest(nextUrl, method, redirectCount + 1)
              .then(resolve)
              .catch(reject);
            return;
          }

          resolve(statusCode);
        }
      );

      request.on('error', (err) => {
        reject(err);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Timeout'));
      });

      request.end();
    });
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Try HEAD first to save bandwidth
      let status = await doRequest(urlStr, 'HEAD');

      // If HEAD is not allowed (405) or Forbidden (403 - possibly due to signature method mismatch), try GET
      if (status === 405 || status === 403) {
        logger.warn(
          `isCanAccessUrl: HEAD method returned ${status} for ${urlStr}, retrying with GET`
        );
        status = await doRequest(urlStr, 'GET');
      }

      // Check status code
      if (status >= 200 && status < 400) {
        return true;
      }

      // Return false for 4xx/5xx errors without retrying
      logger.warn(`isCanAccessUrl: Failed to access ${urlStr}, status: ${status}`);
      return false;
    } catch (error: any) {
      const isLastAttempt = attempt === MAX_RETRIES;
      const errorMessage = error.message;

      logger.error(
        `isCanAccessUrl: Error accessing ${urlStr} (Attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${errorMessage}`
      );

      if (isLastAttempt) {
        return false;
      }

      // Optional: wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return false;
}
