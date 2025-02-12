import { getAnchorInfoFromGiftList } from '@tk-crawler/core/requests/live';
import logger from '../logger';
import { getTokens } from '../mock/tokens';

export default async function getAnchorInfoFromGiftListTest() {
  const res = await getAnchorInfoFromGiftList({
    roomId: '7470427243639032597',
    tokens: getTokens(),
    region: 'all',
  });
  logger.info(res, 'getAnchorRankLeagueAndRegionTest');
  return res;
}
