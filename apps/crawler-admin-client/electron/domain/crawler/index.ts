import type { Area } from '@tk-crawler/biz-shared';
import type { MessageCenter } from '@tk-crawler/shared';
import { CrawlStatus } from '@tk-crawler/biz-shared';
import { LiveAnchorCrawler } from '@tk-crawler/core';
import config from '../../config';

export class Crawler {
  private _liveAnchorCrawler: LiveAnchorCrawler;

  private _messageCenter: MessageCenter;

  get crawlArea() {
    return this._liveAnchorCrawler.crawlArea;
  }

  setCrawlArea(crawlArea: Area | 'all') {
    this._liveAnchorCrawler.setCrawlArea(crawlArea);
  }

  get crawlStatus() {
    if (this._liveAnchorCrawler.isSuspended) {
      return CrawlStatus.SUSPENDED;
    }
    if (this._liveAnchorCrawler.isRunning) {
      return CrawlStatus.RUNNING;
    }
    return CrawlStatus.STOPPED;
  }

  constructor(props: { messageCenter: MessageCenter }) {
    this._messageCenter = props.messageCenter;
    this._liveAnchorCrawler = new LiveAnchorCrawler({
      crawlerInterval: config.crawlerInterval,
      messageCenter: props.messageCenter,
    });
  }

  async start() {
    await this._liveAnchorCrawler.start();
  }

  stop() {
    this._liveAnchorCrawler.stop();
  }

  clear() {
    this._liveAnchorCrawler.clear();
    this.stop();
  }
}
