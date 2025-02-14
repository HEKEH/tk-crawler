import type { MessageCenter } from '@tk-crawler/shared';
import { LiveAnchorCrawler } from '@tk-crawler/core';
import config from '../../config';

export class Crawler {
  private _liveAnchorCrawler: LiveAnchorCrawler;

  private _messageCenter: MessageCenter;

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
