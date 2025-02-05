import { getAnchorInfoFromEnter } from '@tk-crawler/core/requests/live';
import logger from '../logger';
import { getTokens } from '../mock/tokens';

export default async function getAnchorInfoFromEnterTest() {
  const res = await getAnchorInfoFromEnter({
    roomId: '7466991585306151687',
    tokens: getTokens(),
    region: 'all',
  });
  logger.info(res, 'getAnchorInfoFromEnter');
  return res;
}
