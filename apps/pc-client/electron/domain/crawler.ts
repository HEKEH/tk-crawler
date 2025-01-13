import type { Region } from '@tk-crawler/core';
import { LiveAnchorCrawler } from '@tk-crawler/core';
import config from '../config';
import { logger } from '../infra/logger';

export class Crawler {
  private _region: Region | 'all' = 'all';
  private _liveAnchorCrawler: LiveAnchorCrawler = new LiveAnchorCrawler({
    crawlerInterval: config.crawlerInterval,
  });

  constructor() {}

  setRegion(region: Region | 'all') {
    this._region = region;
  }

  async start() {
    this._liveAnchorCrawler.start({
      region: this._region,
      onAnchorsCollected: anchors => {
        logger.info(anchors);
      },
    });
  }
}
