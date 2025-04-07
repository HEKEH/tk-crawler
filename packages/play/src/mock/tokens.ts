import { getInformalMessageToken, getVerifyFp } from '@tk-crawler/biz-shared';

export function getTokens() {
  return {
    verifyFp: getVerifyFp(),
    msToken: getInformalMessageToken(),
  };
}
