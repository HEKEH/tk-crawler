import { getInformalMessageToken } from '@tk-crawler/biz-shared';
import { getLogger } from '@tk-crawler/core/infra/logger';
import { getMsTokenFromCookie } from './cookie';

let msTokenFromResponse = '';

export function saveResponseMessageToken(token: string) {
  if (token) {
    getLogger().info('setMessageToken', token);
    msTokenFromResponse = token;
  }
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
