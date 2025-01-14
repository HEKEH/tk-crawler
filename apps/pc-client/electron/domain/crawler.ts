import type { LiveAnchorCrawlerSetting } from '@tk-crawler/core';
import { LiveAnchorCrawler } from '@tk-crawler/core';
import config from '../config';
import { logger } from '../infra/logger';

export const DEFAULT_LIVE_ANCHOR_CRAWLER_SETTING: LiveAnchorCrawlerSetting = {
  region: 'all',
  outdatedDays: 30,
  queryLimitOneHour: 50,
  queryLimitOneDay: 280,
};

export class Crawler {
  private static _instance: Crawler | null = null;
  private _liveAnchorCrawler: LiveAnchorCrawler = new LiveAnchorCrawler({
    crawlerInterval: config.crawlerInterval,
  });

  private _setting: LiveAnchorCrawlerSetting =
    DEFAULT_LIVE_ANCHOR_CRAWLER_SETTING;

  private constructor() {}

  // TODO: 从配置文件中获取
  async getCurrentLiveAnchorCrawlerSetting() {
    return DEFAULT_LIVE_ANCHOR_CRAWLER_SETTING;
  }

  async start(settings: LiveAnchorCrawlerSetting) {
    this.stop();
    this._setting = settings;
    this._liveAnchorCrawler.start({
      settings: this._setting,
      onAnchorsCollected: anchors => {
        logger.info(anchors);
      },
    });
  }

  stop() {
    this._liveAnchorCrawler.stop();
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new Crawler();
    }
    return this._instance;
  }
}
