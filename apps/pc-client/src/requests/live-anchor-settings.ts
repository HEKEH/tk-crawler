import type { LiveAnchorCrawlerSettings } from '@tk-crawler/shared';
import { CUSTOM_EVENTS } from '../constants';

export function getLiveAnchorCrawlerSettings(): Promise<LiveAnchorCrawlerSettings> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING);
}
