import type { Crawler } from './crawler';
import process from 'node:process';
import {
  mysqlClient,
  setLogger as setDatabaseLogger,
} from '@tk-crawler/database';
import config from './config';
import { TK87Crawler } from './crawler';
import { logger } from './infra/logger';

class App {
  private _isClosed = false;

  private _crawler: Crawler = new TK87Crawler();

  async run() {
    logger.info('App is running');
    try {
      const { success, end } = await this._crawler.run();
      logger.info('Crawler run result', success, end);
      if (!success) {
        logger.error('Crawler run failed');
      }
      if (end) {
        logger.info('Crawler run end');
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
