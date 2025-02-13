import type { CommonResult } from '@tk-crawler/shared';
import type { Crawler } from '../crawler';
import type { ViewManager } from '../view';
import { checkTiktokCookieValid, getMsTokenFromCookie } from '@tk-crawler/core';
import { getVerifyFp } from '@tk-crawler/core/requests/utils/params';
import { ipcMain } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { logger } from '../../infra/logger';
import { syncTiktokCookie } from './cookie';

export class Services {
  private _crawler: Crawler;
  private _viewManager: ViewManager;
  constructor({
    crawler,
    viewManager,
  }: {
    crawler: Crawler;
    viewManager: ViewManager;
  }) {
    this._crawler = crawler;
    this._viewManager = viewManager;
  }

  private async _startCrawl(): Promise<CommonResult<void>> {
    try {
      await this._crawler.start();
      return {
        success: true,
      };
    } catch (error) {
      logger.error('Failed to start live anchor crawl', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private _stopCrawl() {
    try {
      this._crawler.stop();
      return {
        success: true,
      };
    } catch (error) {
      logger.error('Failed to stop live anchor crawl', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  init() {
    syncTiktokCookie();
    ipcMain.handle(CUSTOM_EVENTS.CHECK_COOKIE_VALIDITY, async () => {
      const isCookieValid = await checkTiktokCookieValid({
        tokens: {
          verifyFp: getVerifyFp(),
          msToken: getMsTokenFromCookie(),
        },
      });
      return isCookieValid;
    });
    ipcMain.handle(CUSTOM_EVENTS.OPEN_TIKTOK_LOGIN_PAGE, () => {
      return this._viewManager.openTkLoginPage();
    });
    ipcMain.handle(CUSTOM_EVENTS.START_LIVE_ANCHOR_CRAWL, () => {
      return this._startCrawl();
    });
    ipcMain.handle(CUSTOM_EVENTS.STOP_LIVE_ANCHOR_CRAWL, () => {
      return this._stopCrawl();
    });
  }

  destroy() {
    ipcMain.removeHandler(CUSTOM_EVENTS.CHECK_COOKIE_VALIDITY);
    ipcMain.removeHandler(CUSTOM_EVENTS.OPEN_TIKTOK_LOGIN_PAGE);
  }
}
