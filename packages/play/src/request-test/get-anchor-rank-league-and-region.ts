import { getAnchorRankLeagueAndRegion } from '@tk-crawler/core/requests/live';
import logger from '../logger';
import { getTokens } from '../mock/tokens';

export default async function getAnchorRankLeagueAndRegionTest() {
  const res = await getAnchorRankLeagueAndRegion({
    roomId: '7470427243639032597',
    tokens: getTokens(),
    region: 'all',
  });
  logger.info(res, 'getAnchorRankLeagueAndRegionTest');
  return res;
}
