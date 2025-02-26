import type { CommonResult } from '@tk-crawler/shared';
import { CUSTOM_EVENTS } from '../constants';

export function stopLiveAnchorCrawl(): Promise<CommonResult<void>> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.STOP_LIVE_ANCHOR_CRAWL);
}
