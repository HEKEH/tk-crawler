import { getLiveDiamonds } from '@tk-crawler/core/requests/live';
import logger from '../logger';
import { msToken, verifyFp } from '../mock/tokens';

export default async function getLiveDiamondsTest() {
  const res = await getLiveDiamonds({
    anchorId: '7163827743665325057',
    roomId: '7463782000441166600',
    tokens: {
      verifyFp,
      msToken,
    },
    region: 'all',
  });
  logger.info(res, 'getLiveDiamonds');
  return res;
}
