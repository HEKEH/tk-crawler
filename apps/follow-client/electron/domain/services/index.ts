import type { CommonResult, MessageCenter } from '@tk-crawler/shared';
import type { Crawler } from '../crawler';
import type { ViewManager } from '../view';
import { checkTiktokCookieValid, getMsTokenFromCookie } from '@tk-crawler/core';
import { getVerifyFp } from '@tk-crawler/core/requests/utils/params';
import { IsCookieValidResultStatus } from '@tk-follow-client/shared';
import { ipcMain } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { logger } from '../../infra/logger';
import { syncTiktokCookie } from './cookie';

export class Services {
  private _crawler: Crawler;
  private _viewManager: ViewManager;

  private _messageCenter: MessageCenter;

  private _eventNames: Array<string> = [];
  constructor({
    crawler,
    viewManager,
    messageCenter,
  }: {
    crawler: Crawler;
    viewManager: ViewManager;
    messageCenter: MessageCenter;
  }) {
    this._crawler = crawler;
    this._viewManager = viewManager;
    this._messageCenter = messageCenter;
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

  private _addEventHandler(
    event: string,
    handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => void,
  ) {
    this._eventNames.push(event);
    ipcMain.handle(event, handler);
  }

  private _removeEventHandlers() {
    this._eventNames.forEach(event => {
      ipcMain.removeHandler(event);
    });
    this._eventNames = [];
  }

  init() {
    syncTiktokCookie();
    this._addEventHandler(CUSTOM_EVENTS.CHECK_COOKIE_VALIDITY, async () => {
      try {
        const isCookieValid = await checkTiktokCookieValid({
          tokens: {
            verifyFp: getVerifyFp(),
            msToken: getMsTokenFromCookie(),
          },
        });
        return isCookieValid
          ? IsCookieValidResultStatus.SUCCESS
          : IsCookieValidResultStatus.FAILED;
      } catch (error) {
        logger.error('Failed to check Tiktok cookie validity', error);
        if ((error as any).code === 'ECONNRESET') {
          return IsCookieValidResultStatus.ECONNRESET;
        }
        if ((error as any).code === 'ETIMEDOUT') {
          return IsCookieValidResultStatus.TIMEOUT;
        }
        return IsCookieValidResultStatus.OTHER_ERROR;
      }
    });
    this._addEventHandler(CUSTOM_EVENTS.OPEN_TIKTOK_LOGIN_PAGE, () => {
      return this._viewManager.openTkLoginPage();
    });
    this._addEventHandler(CUSTOM_EVENTS.START_LIVE_ANCHOR_CRAWL, () => {
      return this._startCrawl();
    });
    this._addEventHandler(CUSTOM_EVENTS.STOP_LIVE_ANCHOR_CRAWL, () => {
      return this._stopCrawl();
    });
  }

  destroy() {
    this._removeEventHandlers();
  }
}
