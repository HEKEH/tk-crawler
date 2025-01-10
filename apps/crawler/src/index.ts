import process from 'node:process';
import { init as webmssdkInit } from 'tk-crack/webmssdk';
import config from './config';
import Crawler from './domain';
import { logger } from './infra/logger';

const { env } = process;
logger.info('[env]', env.NODE_ENV);
logger.info('[port]', config.port);

(async () => {
  webmssdkInit({
    aid: 278,
    isSDK: false,
    boe: false,
    enablePathList: [],
    region: 'sg-tiktok',
    mode: 513,
  });
  const crawler = new Crawler();
  process.on('SIGINT', () => {
    crawler.stop();
    process.exit(0);
  });
  await crawler.start();
  logger.info('Crawler start successfully');
})();
