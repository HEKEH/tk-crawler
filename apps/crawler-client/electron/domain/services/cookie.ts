import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { setTiktokCookie } from '@tk-crawler/core';
import { getTiktokCookiePath } from '../../constants';
import { logger } from '../../infra/logger';

/** 把 cookie 同步到core */
export function syncTiktokCookie() {
  const cookiePath = getTiktokCookiePath();
  if (!existsSync(cookiePath)) {
    return;
  }
  const cookie = readFileSync(cookiePath, 'utf-8');
  const cookieObject = JSON.parse(cookie) as [string, string][];
  const cookieString = cookieObject
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  setTiktokCookie(cookieString);
}

export function saveTiktokCookie(cookies: [string, string][]) {
  const cookiePath = getTiktokCookiePath();
  if (!cookiePath) {
    throw new Error('Cookie path is not set');
  }
  try {
    const dir = dirname(cookiePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(cookiePath, JSON.stringify(cookies));
  } catch (error) {
    logger.error('Failed to save cookie file:', error);
    return;
  }

  // Save cookies to file
  writeFileSync(cookiePath, JSON.stringify(cookies));
  const cookieString = cookies
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  setTiktokCookie(cookieString);
}
