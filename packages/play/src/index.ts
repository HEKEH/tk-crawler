import { setLogger, setTiktokCookie } from '@tk-crawler/core';
import logger from './logger';
import { mockCookie } from './mock/cookie';
import checkCookieTest from './request-test/check-cookie';

async function main() {
  setLogger(logger);
  setTiktokCookie(mockCookie);
  await checkCookieTest();
  // await getFeedTest();
  // await getLiveDiamondsTest();
  // await getAnchorInfoFromEnterTest();
  // await getAnchorRankLeagueTest();
}

main();
