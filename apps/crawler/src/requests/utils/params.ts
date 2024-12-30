import xbogus from 'xbogus';
import { USER_AGENT } from '../constants';

export function getXBogus(url: string, userAgent: string = USER_AGENT) {
  const res = xbogus(url, userAgent);
  return res;
}

export function getMessageToken() {
  const randomLength = 107;
  let randomStr = '';
  const baseStr = 'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789-_';
  const length = baseStr.length - 1;
  for (let i = 0; i < randomLength; i++) {
    randomStr += baseStr[Math.floor(Math.random() * length)];
  }
  return randomStr;
}

export function getVerifyFp() {
  const randomLength = 45;
  let randomStr = '';
  const baseStr = 'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789_';
  const length = baseStr.length - 1;
  for (let i = 0; i < randomLength; i++) {
    randomStr += baseStr[Math.floor(Math.random() * length)];
  }
  return `verify_${randomStr}`;
}
