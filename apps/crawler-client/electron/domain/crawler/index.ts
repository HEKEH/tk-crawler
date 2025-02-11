import { LiveAnchorCrawler } from '@tk-crawler/core';
import config from '../../config';

export class Crawler {
  private _liveAnchorCrawler: LiveAnchorCrawler = new LiveAnchorCrawler({
    crawlerInterval: config.crawlerInterval,
  });

  constructor() {}

  async start() {
    this.stop();
    console.log('Crawler start');
    // this._liveAnchorCrawler.start({
    //   settings,
    //   onAnchorsCollected: anchors => {
    //     logger.info(anchors);
    //   },
    // });
  }

  stop() {
    console.log('Crawler stop');
    this._liveAnchorCrawler.stop();
  }
}
