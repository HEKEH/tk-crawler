import type { Crawler } from './crawler';
import {
  mysqlClient,
  setLogger as setDatabaseLogger,
} from '@tk-crawler/database';
import { TK87Crawler } from './crawler';
import { logger } from './infra/logger';

class App {
  private _isClosed = false;

  private _crawler: Crawler = new TK87Crawler();

  async run() {
    logger.info('App is running');
    const result = await this._crawler.run();
    logger.info('Crawler run result', result);
    if (!result) {
      logger.error('Crawler run failed');
      await this.close();
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
      await new Promise(resolve => setTimeout(resolve, 900));
    }
  }

  async close() {
    await mysqlClient.disconnect();
    logger.info('App is closing');
    this._isClosed = true;
  }
}

export default function initApp() {
  const app = new App();
  app.start();
  return app;
}
