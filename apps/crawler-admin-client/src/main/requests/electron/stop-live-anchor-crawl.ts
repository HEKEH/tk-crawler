import type { CommonResult } from '@tk-crawler/shared';
import { CRAWL_EVENTS } from '../../constants';

export function stopLiveAnchorCrawl(): Promise<CommonResult<void>> {
  return window.ipcRenderer.invoke(CRAWL_EVENTS.STOP_LIVE_ANCHOR_CRAWL);
}
