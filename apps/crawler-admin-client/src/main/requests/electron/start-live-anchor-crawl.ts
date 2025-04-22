import type { CommonResult } from '@tk-crawler/shared';
import { CRAWL_EVENTS } from '../../constants';

export function startLiveAnchorCrawl(): Promise<CommonResult<void>> {
  return window.ipcRenderer.invoke(CRAWL_EVENTS.START_LIVE_ANCHOR_CRAWL);
}
