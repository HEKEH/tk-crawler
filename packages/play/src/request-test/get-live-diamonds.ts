import { getLiveDiamonds } from '@tk-crawler/core/requests/live';
import logger from '../logger';
import { getTokens } from '../mock/tokens';

export default async function getLiveDiamondsTest() {
  const res = await getLiveDiamonds({
    anchorId: '6530620800969605121',
    roomId: '7465886902487698197',
    tokens: getTokens(),
    region: 'all',
  });
  logger.info(res, 'getLiveDiamonds');
  return res;
}
