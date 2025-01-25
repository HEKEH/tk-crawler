import { setLogger } from '@tk-crawler/core';
import logger from './logger';
import getAnchorInfoFromEnterTest from './request-test/get-anchor-info-from-enter';

setLogger(logger);

async function main() {
  // await getLiveDiamondsTest();
  await getAnchorInfoFromEnterTest();
  // await getAnchorRankLeagueTest();
}

main();
