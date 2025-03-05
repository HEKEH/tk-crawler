import type { CommonResult } from '@tk-crawler/shared';
import { CUSTOM_EVENTS } from '../../constants';

export function startLiveAnchorCrawl(): Promise<CommonResult<void>> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.START_LIVE_ANCHOR_CRAWL);
}
