import process from 'node:process';
import config from './config';
import Crawler from './domain';
import { logger } from './infra/logger';

const { env } = process;
logger.info('[env]', env.NODE_ENV);
logger.info('[port]', config.port);

(async () => {
  const crawler = new Crawler();
  crawler.start();
  process.on('SIGINT', () => {
    crawler.stop();
    process.exit(0);
  });
})();
