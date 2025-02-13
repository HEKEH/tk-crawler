import { LiveAnchorCrawler } from '@tk-crawler/core';
import config from '../../config';

export class Crawler {
  private _liveAnchorCrawler: LiveAnchorCrawler = new LiveAnchorCrawler({
    crawlerInterval: config.crawlerInterval,
  });

  constructor() {}

  async start() {
    this.stop();
    this._liveAnchorCrawler.start();
  }

  stop() {
    this._liveAnchorCrawler.stop();
  }
}
