import { getInformalMessageToken, getVerifyFp } from '@tk-crawler/biz-shared';

export function getQueryTokens() {
  return {
    verifyFp: getVerifyFp(),
    msToken: getInformalMessageToken(),
  };
}
