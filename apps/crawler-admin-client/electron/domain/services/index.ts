import type { CommonResult, MessageCenter } from '@tk-crawler/shared';
import type { Crawler } from '../crawler';
import type { ViewsManager } from '../views';
import {
  CRAWL_EVENTS,
  IsCookieValidResultStatus,
  TOKEN_EVENTS,
} from '@tk-crawler-admin-client/shared';
import { getVerifyFp } from '@tk-crawler/biz-shared';
import { initProxy } from '@tk-crawler/electron-utils/main';
import {
  checkTiktokCookieValid,
  getMsTokenFromCookie,
} from '@tk-crawler/tk-requests';
import { ipcMain } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { logger } from '../../infra/logger';
import {
  clearTiktokCookie,
  getTiktokCookie,
  saveTiktokCookie,
  syncTiktokCookie,
} from './cookie';
import { getToken, removeToken, saveToken } from './token';

export class Services {
  private _crawler: Crawler;
  private _viewManager: ViewsManager;

  private _messageCenter: MessageCenter;

  private _eventNames: Array<string> = [];
  constructor({
    crawler,
    viewManager,
    messageCenter,
  }: {
    crawler: Crawler;
    viewManager: ViewsManager;
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
    const checkTiktokCookieValidHandler = async () => {
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
    };
    this._addEventHandler(CUSTOM_EVENTS.CHECK_COOKIE_VALIDITY, () => {
      return checkTiktokCookieValidHandler();
    });
    this._addEventHandler(CUSTOM_EVENTS.RECHECK_COOKIE_VALIDITY, async () => {
      await initProxy(logger);
      return checkTiktokCookieValidHandler();
    });
    this._addEventHandler(CUSTOM_EVENTS.OPEN_TIKTOK_LOGIN_PAGE, async () => {
      await initProxy(logger);
      return this._viewManager.openTkLoginPage();
    });
    this._addEventHandler(CRAWL_EVENTS.START_LIVE_ANCHOR_CRAWL, () => {
      return this._startCrawl();
    });
    this._addEventHandler(CRAWL_EVENTS.STOP_LIVE_ANCHOR_CRAWL, () => {
      return this._stopCrawl();
    });
    this._addEventHandler(CRAWL_EVENTS.GET_CRAWL_STATUS, () => {
      return this._crawler.crawlStatus;
    });
    this._addEventHandler(CRAWL_EVENTS.GET_CRAWL_AREA, () => {
      return this._crawler.crawlArea;
    });
    this._addEventHandler(CRAWL_EVENTS.SET_CRAWL_AREA, (_, crawlArea) => {
      this._crawler.setCrawlArea(crawlArea);
    });
    this._addEventHandler(CRAWL_EVENTS.GET_TK_COOKIE, () => {
      return getTiktokCookie();
    });
    this._addEventHandler(CRAWL_EVENTS.SET_TK_COOKIE, (_, cookie) => {
      return saveTiktokCookie(cookie);
    });
    this._addEventHandler(CRAWL_EVENTS.CLEAR_TIKTOK_COOKIE, clearTiktokCookie);
    this._addEventHandler(TOKEN_EVENTS.GET_TOKEN, getToken);
    this._addEventHandler(TOKEN_EVENTS.SET_TOKEN, (_, token) =>
      saveToken(token),
    );
    this._addEventHandler(TOKEN_EVENTS.REMOVE_TOKEN, removeToken);
  }

  destroy() {
    this._removeEventHandlers();
  }
}
