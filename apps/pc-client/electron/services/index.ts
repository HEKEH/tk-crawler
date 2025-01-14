import { ipcMain } from 'electron';
import { CUSTOM_EVENTS } from '../constants';
import { getLiveAnchorCrawlerSettings } from './live-anchor-settings';

export function initServices() {
  ipcMain.handle(
    CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING,
    getLiveAnchorCrawlerSettings,
  );
}
