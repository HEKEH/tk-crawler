import { ipcMain } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { getLiveAnchorCrawlerSettings } from './live-anchor-settings';

export class Services {
  constructor() {}
  init() {
    ipcMain.handle(
      CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING,
      getLiveAnchorCrawlerSettings,
    );
  }

  destroy() {
    ipcMain.removeHandler(CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING);
  }
}
