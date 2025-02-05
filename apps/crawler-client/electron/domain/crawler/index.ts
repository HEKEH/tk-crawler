import type { LiveAnchorCrawlerSettings } from '@tk-crawler/shared';
import { LiveAnchorCrawler } from '@tk-crawler/core';
import config from '../../config';
import { logger } from '../../infra/logger';

export class Crawler {
  private _liveAnchorCrawler: LiveAnchorCrawler = new LiveAnchorCrawler({
    crawlerInterval: config.crawlerInterval,
  });

  constructor() {}

  async start(settings: LiveAnchorCrawlerSettings) {
    this.stop();
    this._liveAnchorCrawler.start({
      settings,
      onAnchorsCollected: anchors => {
        logger.info(anchors);
      },
    });
  }

  stop() {
    this._liveAnchorCrawler.stop();
  }
}
