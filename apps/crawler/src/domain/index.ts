import config from '../config';
import { logger } from '../infra/logger';

/** 爬虫逻辑 */
class Crawler {
  private _interval: NodeJS.Timeout | undefined;
  constructor() {}

  private _run() {
    logger.info('crawler run');
  }

  start() {
    logger.info('crawler start');
    this._interval = setInterval(() => {
      this._run();
    }, config.crawlerInterval);
  }

  stop() {
    logger.info('crawler stop');
    clearInterval(this._interval);
  }
}

export default Crawler;
