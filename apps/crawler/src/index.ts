import process from 'node:process';
import { Crawler } from '@tk-crawler/core';
import config from './config';
import { logger } from './infra/logger';

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
