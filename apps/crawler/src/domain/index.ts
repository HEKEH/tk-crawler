import config from '../config';
import { LANGUAGE } from '../constants';
import { logger } from '../infra/logger';
import getFeed from '../requests/feed';

/** 爬虫逻辑 */
class Crawler {
  private _interval: NodeJS.Timeout | undefined;
  constructor() {}

  private async _run() {
    const feed = await getFeed({ lng: LANGUAGE['ZH-CN'] });
    logger.info('[feed]', feed);
  }

  start() {
    logger.info('crawler start');
    this._run();
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
