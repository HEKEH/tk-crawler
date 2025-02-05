import { randomBytes } from 'node:crypto';
import { getMsTokenFromCookie } from './cookie';

let msTokenFromResponse = '';

export function setMessageToken(token: string) {
  if (token) {
    msTokenFromResponse = token;
  }
}

const MESSAGE_TOKEN_CHARS =
  'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789-_';
export function getMessageToken() {
  if (msTokenFromResponse) {
    // console.log(msTokenFromResponse, 'msTokenFromResponse');
    return msTokenFromResponse;
  }
  const tokenFromCookie = getMsTokenFromCookie();
  if (tokenFromCookie) {
    // console.log(tokenFromCookie, 'msTokenFromCookie');
    return tokenFromCookie;
  }
  const randomValues = randomBytes(155);
  const result = `${Array.from(
    randomValues,
    value => MESSAGE_TOKEN_CHARS[value % MESSAGE_TOKEN_CHARS.length],
  ).join('')}=`;
  return result;
}
