import type { LiveAnchorCrawler } from '@tk-crawler/core';

export class Crawler {
  private _liveAnchorCrawler: LiveAnchorCrawler | null = null;

  private _onCookieOutdated() {
    // TODO: 处理 cookie 过期
  }

  constructor() {
    // this._liveAnchorCrawler = new LiveAnchorCrawler({
    //   crawlerInterval: config.crawlerInterval,
    // });
  }

  async start() {
    this.stop();
    this._liveAnchorCrawler?.start();
  }

  stop() {
    this._liveAnchorCrawler?.stop();
  }
}
