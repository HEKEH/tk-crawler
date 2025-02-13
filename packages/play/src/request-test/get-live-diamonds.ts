import { getLiveDiamonds } from '@tk-crawler/core/requests/live';
import logger from '../logger';
import { getTokens } from '../mock/tokens';

export default async function getLiveDiamondsTest() {
  const res = await getLiveDiamonds({
    anchorId: '7234397258057319426',
    roomId: '7470749521309108999',
    tokens: getTokens(),
    region: 'all',
  });
  logger.info(res, 'getLiveDiamonds');
  return res;
}
