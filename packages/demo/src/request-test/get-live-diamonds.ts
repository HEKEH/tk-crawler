import { getLiveDiamonds } from '@tk-crawler/core/requests/live';
import logger from '../logger';
import { msToken, verifyFp } from '../mock/tokens';

export default async function getLiveDiamondsTest() {
  const res = await getLiveDiamonds({
    anchorId: '7282400309514028037',
    roomId: '7463703863376972549',
    tokens: {
      verifyFp,
      msToken,
    },
    region: 'all',
  });
  logger.info(res, 'getLiveDiamonds');
  return res;
}
