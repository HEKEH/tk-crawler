import { setLogger, setTiktokCookie } from '@tk-crawler/core';
import logger from './logger';
import { mockCookie } from './mock/cookie';
import checkCookieTest from './request-test/check-cookie';
import getAnchorRankLeagueAndRegionTest from './request-test/get-anchor-rank-league-and-region';
// import getAnchorInfoFromEnterTest from './request-test/get-anchor-info-from-enter';

async function main() {
  setLogger(logger);
  setTiktokCookie(mockCookie);
  await checkCookieTest();
  // await getFeedTest();
  // await getLiveDiamondsTest();
  // await getAnchorInfoFromEnterTest();
  await getAnchorRankLeagueAndRegionTest();
}

main();
