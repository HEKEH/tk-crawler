import { setLogger } from '@tk-crawler/core';
import logger from './logger';
import getLiveDiamondsTest from './request-test/get-live-diamonds';

setLogger(logger);

async function main() {
  await getLiveDiamondsTest();
}

main();
