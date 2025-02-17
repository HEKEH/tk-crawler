import process from 'node:process';
import initApp from './app';
import config from './config';
import { logger } from './infra/logger';

const { env } = process;
logger.info('[env]', env.NODE_ENV);
logger.info('[port]', config.port);

(async () => {
  logger.info('server start');
  // await initMongoDB();
  // await SocketModel.deleteMany({}); // delete all socket history data

  initApp().listen(config.port, async () => {
    logger.info(`>>> server listen on http://localhost:${config.port}`);
  });

  return null;
})();
