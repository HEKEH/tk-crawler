import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { setTiktokCookie } from '@tk-crawler/tk-requests';
import { getTiktokCookiePath } from '../../constants';
import { logger } from '../../infra/logger';

/** 把 cookie 同步到core */

export function getTiktokCookie() {
  const cookiePath = getTiktokCookiePath();
  if (!existsSync(cookiePath)) {
    return;
  }
  let cookie = readFileSync(cookiePath, 'utf-8');
  cookie = cookie.trim();
  let cookieString: string;
  if (cookie.startsWith('[')) {
    const cookieObject = JSON.parse(cookie) as [string, string][];
    cookieString = cookieObject
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  } else {
    cookieString = cookie;
  }
  return cookieString;
}

export function syncTiktokCookie() {
  const cookieString = getTiktokCookie();
  if (!cookieString) {
    return;
  }
  setTiktokCookie(cookieString);
}

export function transformCookieString(cookies: [string, string][] | string) {
  return typeof cookies === 'string'
    ? cookies
    : cookies.map(([key, value]) => `${key}=${value}`).join('; ');
}

export function saveTiktokCookie(cookies: [string, string][] | string) {
  const cookiePath = getTiktokCookiePath();
  if (!cookiePath) {
    throw new Error('Cookie path is not set');
  }
  try {
    const dir = dirname(cookiePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const cookieString = transformCookieString(cookies);
    writeFileSync(cookiePath, cookieString);
    setTiktokCookie(cookieString);
  } catch (error) {
    logger.error('Failed to save cookie file:', error);
  }
}

export function clearTiktokCookie() {
  const cookiePath = getTiktokCookiePath();
  if (!cookiePath) {
    throw new Error('Cookie path is not set');
  }
  try {
    const dir = dirname(cookiePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(cookiePath, '');
    setTiktokCookie('');
  } catch (error) {
    logger.error('Failed to clear cookie file:', error);
  }
}
