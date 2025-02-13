import type { Crawler } from '../crawler';
import { ipcMain } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { getLiveAnchorCrawlerSettings } from './live-anchor-settings';

export class Services {
  private _crawler: Crawler;

  constructor({ crawler }: { crawler: Crawler }) {
    this._crawler = crawler;
  }

  init() {
    ipcMain.handle(
      CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING,
      getLiveAnchorCrawlerSettings,
    );
    ipcMain.handle(
      CUSTOM_EVENTS.SUBMIT_LIVE_ANCHOR_CRAWLER_SETTING,
      async () => {
        await this._crawler.start();
        return {
          success: true,
        };
      },
    );
  }

  destroy() {
    ipcMain.removeHandler(CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING);
    ipcMain.removeHandler(CUSTOM_EVENTS.SUBMIT_LIVE_ANCHOR_CRAWLER_SETTING);
  }
}
