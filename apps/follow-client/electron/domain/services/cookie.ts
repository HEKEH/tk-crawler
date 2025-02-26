// import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
// import { dirname } from 'node:path';
// import { setTiktokCookie } from '@tk-crawler/core';
// import { getTiktokCookiePath } from '../../constants';
// import { logger } from '../../infra/logger';

// /** 把 cookie 同步到core */
// export function syncTiktokCookie() {
//   const cookiePath = getTiktokCookiePath();
//   if (!existsSync(cookiePath)) {
//     return;
//   }
//   let cookie = readFileSync(cookiePath, 'utf-8');
//   cookie = cookie.trim();
//   let cookieString: string;
//   if (cookie.startsWith('[')) {
//     const cookieObject = JSON.parse(cookie) as [string, string][];
//     cookieString = cookieObject
//       .map(([key, value]) => `${key}=${value}`)
//       .join('; ');
//   } else {
//     cookieString = cookie;
//   }
//   setTiktokCookie(cookieString);
// }

// export function saveTiktokCookie(cookies: [string, string][] | string) {
//   const cookiePath = getTiktokCookiePath();
//   if (!cookiePath) {
//     throw new Error('Cookie path is not set');
//   }
//   try {
//     const dir = dirname(cookiePath);
//     if (!existsSync(dir)) {
//       mkdirSync(dir, { recursive: true });
//     }
//     const cookieString =
//       typeof cookies === 'string'
//         ? cookies
//         : cookies.map(([key, value]) => `${key}=${value}`).join('; ');
//     writeFileSync(cookiePath, cookieString);
//     setTiktokCookie(cookieString);
//   } catch (error) {
//     logger.error('Failed to save cookie file:', error);
//   }
// }
