import { getVerifyFp } from '@tk-crawler/biz-shared';
import { getAnchorInfoFromEnter } from '@tk-crawler/core/requests/live';
import { getFormalMessageToken } from '@tk-crawler/core/requests/utils/params';
import logger from '../logger';

export default async function getAnchorInfoFromEnterTest() {
  const res = await getAnchorInfoFromEnter({
    roomId: '7470749521309108999',
    tokens: {
      verifyFp: getVerifyFp(),
      msToken: getFormalMessageToken(),
    },
    region: 'all',
  });
  logger.info(res, 'getAnchorInfoFromEnter');
  return res;
}
