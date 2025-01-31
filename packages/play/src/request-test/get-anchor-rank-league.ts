import { getAnchorRankLeague } from '@tk-crawler/core/requests/live';
import logger from '../logger';
import { getTokens } from '../mock/tokens';

export default async function getAnchorRankLeagueTest() {
  const res = await getAnchorRankLeague({
    roomId: '7463782000441166600',
    tokens: getTokens(),
    region: 'all',
  });
  logger.info(res, 'getAnchorRankLeagueTest');
  return res;
}
