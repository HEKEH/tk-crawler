import type { LiveAnchorCrawlerSettings } from '@tk-crawler/shared';

const DEFAULT_LIVE_ANCHOR_CRAWLER_SETTING: LiveAnchorCrawlerSettings = {
  region: 'all',
  outdatedDays: 30,
  queryLimitOneHour: 50,
  queryLimitOneDay: 280,
};

export function getLiveAnchorCrawlerSettings(): Promise<LiveAnchorCrawlerSettings> {
  return Promise.resolve(DEFAULT_LIVE_ANCHOR_CRAWLER_SETTING);
}
