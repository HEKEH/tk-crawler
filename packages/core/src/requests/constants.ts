export const BROWSER_VERSION =
  '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export const BROWSER_NAME = 'Mozilla';
export const USER_AGENT = `${BROWSER_NAME}/${BROWSER_VERSION}`;

(globalThis as any).$USER_AGENT = USER_AGENT;
