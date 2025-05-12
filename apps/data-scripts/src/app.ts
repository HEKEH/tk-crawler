import type { Runner } from './runner';
import process from 'node:process';
import {
  mysqlClient,
  setLogger as setDatabaseLogger,
} from '@tk-crawler/database';
import config from './config';
import { logger } from './infra/logger';
import { AreaUpdateRunner } from './runner';

class App {
  private _isClosed = false;

  // private _runner: Runner = new TK87Crawler();

  private _runner: Runner = new AreaUpdateRunner();

  async run() {
    logger.info('App is running');
    try {
      const { success, end } = await this._runner.run();
      logger.info('Runner run result', { success, end });
      if (!success) {
        logger.error('Runner run failed');
      }
      if (end) {
        logger.info('Runner run end');
        await this.close();
      }
    } catch (error) {
      logger.error('App run error', error);
    }
  }

  async start() {
    try {
      setDatabaseLogger(logger);
      await mysqlClient.connect();
    } catch (error) {
      logger.error('Start Databases Error:', error);
      return;
    }
    logger.info('App is starting');
    while (!this._isClosed) {
      await this.run();
      await new Promise(resolve => setTimeout(resolve, config.crawlInterval));
    }
  }

  async close() {
    logger.info('App is closing');
    await mysqlClient.disconnect();
    this._isClosed = true;
    process.exit(0);
  }
}

export default function initApp() {
  const app = new App();
  app.start();
  return app;
}
