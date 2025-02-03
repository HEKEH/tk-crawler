import { setLogger } from '@tk-crawler/core';
import logger from './logger';
import getFeedTest from './request-test/feed';

setLogger(logger);

async function main() {
  await getFeedTest();
  // await getLiveDiamondsTest();
  // await getAnchorInfoFromEnterTest();
  // await getAnchorRankLeagueTest();
}

main();
