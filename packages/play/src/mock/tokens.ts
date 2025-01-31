import {
  getMessageToken,
  getVerifyFp,
} from '@tk-crawler/core/requests/utils/params';

export function getTokens() {
  return {
    verifyFp: getVerifyFp(),
    msToken: getMessageToken(),
  };
}
