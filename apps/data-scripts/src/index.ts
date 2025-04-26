import process from 'node:process';
import initApp from './app';
import { logger } from './infra/logger';

const { env } = process;
logger.info('[env]', env.NODE_ENV);

(async () => {
  logger.info('data-scripts start');

  let shutdownInProgress = false;

  const app = await initApp();

  const gracefulShutdown = async (signal: string) => {
    if (shutdownInProgress) {
      return;
    }
    shutdownInProgress = true;

    logger.info(`Received ${signal} signal, starting graceful shutdown...`);

    try {
      logger.info('Closing database connections...');
      await app.close();
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
    // gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', reason => {
    logger.error('Unhandled Promise rejection:', reason);
    // gracefulShutdown('unhandledRejection');
  });
})();
