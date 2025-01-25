import { setLogger } from '@tk-crawler/core';
import logger from './logger';
import getAnchorInfoFromEnterTest from './request-test/get-anchor-info-from-enter';
import getAnchorRankLeagueTest from './request-test/get-anchor-rank-league';
import getLiveDiamondsTest from './request-test/get-live-diamonds';

setLogger(logger);

async function main() {
  // await getLiveDiamondsTest();
  // await getAnchorInfoFromEnterTest();
  await getAnchorRankLeagueTest();
}

main();
