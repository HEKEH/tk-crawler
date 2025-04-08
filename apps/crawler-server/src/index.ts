import process from 'node:process';
import {
  mysqlClient,
  redisClient,
  setLogger as setDatabaseLogger,
} from '@tk-crawler/database';
import initApp from './app';
import config from './config';
import { logger } from './infra/logger';

const { env } = process;
logger.info('[env]', env.NODE_ENV);
logger.info('[port]', config.port);

(async () => {
  logger.info('crawler server start');
  try {
    setDatabaseLogger(logger);
    await Promise.all([redisClient.connect(config), mysqlClient.connect()]);
  } catch (error) {
    logger.error('Start Databases Error:', error);
    process.exit(1);
  }

  initApp().listen(config.port, async () => {
    logger.info(`>>> crawler server listen on http://localhost:${config.port}`);
  });

  return null;
})();
