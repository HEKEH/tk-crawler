import process from 'node:process';
import {
  redisClient,
  setLogger as setDatabaseLogger,
} from '@tk-crawler/database';
import { mysqlClient } from '@tk-crawler/database/mysql';
import initApp from './app';
import config from './config';
import { logger } from './infra/logger';

const { env } = process;
logger.info('[env]', env.NODE_ENV);
logger.info('[port]', config.port);

(async () => {
  logger.info('server start');
  try {
    setDatabaseLogger(logger);
    await Promise.all([redisClient.connect(config), mysqlClient.connect()]);
  } catch (error) {
    logger.error('Redis Client Error:', error);
    process.exit(1);
  }

  initApp().listen(config.port, async () => {
    logger.info(`>>> server listen on http://localhost:${config.port}`);
  });

  return null;
})();
