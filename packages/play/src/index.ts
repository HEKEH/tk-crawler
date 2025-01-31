import { setLogger } from '@tk-crawler/core';
import logger from './logger';
import getFeedTest from './request-test/feed';
import getAnchorInfoFromEnterTest from './request-test/get-anchor-info-from-enter';

setLogger(logger);

async function main() {
  await getFeedTest();
  // await getLiveDiamondsTest();
  await getAnchorInfoFromEnterTest();
  // await getAnchorRankLeagueTest();
}

main();
