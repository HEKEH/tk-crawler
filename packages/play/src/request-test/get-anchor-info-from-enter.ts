import { getAnchorInfoFromEnter } from '@tk-crawler/core/requests/live';
import logger from '../logger';
import { getTokens } from '../mock/tokens';

export default async function getAnchorInfoFromEnterTest() {
  const res = await getAnchorInfoFromEnter({
    roomId: '7465971365347969813',
    tokens: getTokens(),
    region: 'all',
  });
  logger.info(res, 'getAnchorInfoFromEnter');
  return res;
}
