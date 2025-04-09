import process from 'node:process';
import {
  mysqlClient,
  redisClient,
  setLogger as setDatabaseLogger,
} from '@tk-crawler/database';
import initApp from './app';
import config from './config';
import { GlobalStore } from './domain/global-store';
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

  const server = initApp().listen(config.port, async () => {
    logger.info(`>>> crawler server listen on http://localhost:${config.port}`);
  });

  const globalStore = new GlobalStore();
  await globalStore.init();

  let shutdownInProgress = false;

  const gracefulShutdown = async (signal: string) => {
    if (shutdownInProgress) {
      return;
    }
    shutdownInProgress = true;

    logger.info(`Received ${signal} signal, starting graceful shutdown...`);

    // 1. Stop accepting new HTTP requests
    server.close(() => {
      logger.info('HTTP server closed');
    });

    try {
      await globalStore.destroy();
      // 2. Close database connections
      logger.info('Closing database connections...');
      await Promise.all([redisClient.quit(), mysqlClient.disconnect()]);
      logger.info('Database connections closed');

      // 3. Perform other cleanup operations
      // For example: save state, clean up temporary files, etc.
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Register signal handlers
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Termination signal sent by Docker, Kubernetes, etc.
  process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart signal

  // Handle uncaught exceptions and rejected Promises
  process.on('uncaughtException', error => {
    logger.error('Uncaught exception:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', reason => {
    logger.error('Unhandled Promise rejection:', reason);
    gracefulShutdown('unhandledRejection');
  });

  return null;
})();
