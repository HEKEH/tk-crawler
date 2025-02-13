import { getInformalMessageToken, getVerifyFp } from './params';

export function getQueryTokens() {
  return {
    verifyFp: getVerifyFp(),
    msToken: getInformalMessageToken(),
  };
}
