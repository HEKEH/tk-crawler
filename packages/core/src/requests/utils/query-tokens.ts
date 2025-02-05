import { getMessageToken, getVerifyFp } from './params';

export function getQueryTokens() {
  return {
    verifyFp: getVerifyFp(),
    msToken: getMessageToken(),
  };
}
