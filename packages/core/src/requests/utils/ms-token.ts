import { randomBytes } from 'node:crypto';
import { getLogger } from '@tk-crawler/core/infra/logger';
import { getMsTokenFromCookie } from './cookie';

let msTokenFromResponse = '';

export function saveResponseMessageToken(token: string) {
  if (token) {
    getLogger().info('setMessageToken', token);
    msTokenFromResponse = token;
  }
}

const MESSAGE_TOKEN_CHARS =
  'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789-_';

/** 非正式的 msToken */
export function getInformalMessageToken() {
  const randomValues = randomBytes(155);
  const result = `${Array.from(
    randomValues,
    value => MESSAGE_TOKEN_CHARS[value % MESSAGE_TOKEN_CHARS.length],
  ).join('')}=`;
  return result;
}

/** 正式的 msToken */
export function getFormalMessageToken() {
  if (msTokenFromResponse) {
    // console.log(msTokenFromResponse, 'msTokenFromResponse');
    return msTokenFromResponse;
  }
  const tokenFromCookie = getMsTokenFromCookie();
  if (tokenFromCookie) {
    // console.log(tokenFromCookie, 'msTokenFromCookie');
    return tokenFromCookie;
  }
  return getInformalMessageToken();
}
