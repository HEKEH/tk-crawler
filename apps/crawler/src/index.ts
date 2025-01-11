import process from 'node:process';
import { Crawler, logger } from '@tk-crawler/core';
import config from './config';

const { env } = process;
logger.info('[env]', env.NODE_ENV);
logger.info('[port]', config.port);

(async () => {
  const crawler = new Crawler({
    crawlerInterval: config.crawlerInterval,
  });
  process.on('SIGINT', () => {
    crawler.stop();
    process.exit(0);
  });
  await crawler.start();
  logger.info('Crawler start successfully');
})();
