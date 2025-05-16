import type { IsCookieValidResult } from '@tk-crawler-admin-client/shared';
import type { TKGuildUser } from '@tk-crawler/biz-shared';
import type { CommonResult, MessageCenter } from '@tk-crawler/shared';
import type { Crawler } from '../crawler';
import type { ViewsManager } from '../views';
import {
  CRAWL_EVENTS,
  IsCookieValidResultStatus,
  TOKEN_EVENTS,
} from '@tk-crawler-admin-client/shared';
import {
  getVerifyFp,
  GUILD_COOKIE_PAGE_HELP_EVENTS,
} from '@tk-crawler/biz-shared';
import { initProxy } from '@tk-crawler/electron-utils/main';
import {
  checkTiktokCookieValid,
  getMsTokenFromCookie,
} from '@tk-crawler/tk-requests';
import { ipcMain } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { logger } from '../../infra';
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
    const checkTiktokCookieValidHandler =
      async (): Promise<IsCookieValidResult> => {
        try {
          const response = await checkTiktokCookieValid({
            tokens: {
              verifyFp: getVerifyFp(),
              msToken: getMsTokenFromCookie(),
            },
          });
          const isCookieValid = response.success;
          logger.info('checkTiktokCookieValidHandler', response);
          return {
            status: isCookieValid
              ? IsCookieValidResultStatus.SUCCESS
              : IsCookieValidResultStatus.FAILED,
            data: response.data,
          };
        } catch (error) {
          logger.error('Failed to check Tiktok cookie validity', error);
          if ((error as any).code === 'ECONNRESET') {
            return {
              status: IsCookieValidResultStatus.ECONNRESET,
              data: undefined,
            };
          }
          if ((error as any).code === 'ETIMEDOUT') {
            return {
              status: IsCookieValidResultStatus.TIMEOUT,
              data: undefined,
            };
          }
          return {
            status: IsCookieValidResultStatus.OTHER_ERROR,
            data: undefined,
          };
        }
      };
    this._addEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.GO_TO_GUILD_COOKIE_PAGE,
      async (
        _: Electron.IpcMainInvokeEvent,
        data: { guildUser: TKGuildUser },
      ) => {
        logger.info('[GO TO GUILD COOKIE PAGE]', data);
        return this._viewManager.openCookiePage(data);
      },
    );
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
    this._addEventHandler(CRAWL_EVENTS.GET_SIMPLE_CRAWL_STATISTICS, () => {
      return this._crawler.simpleCrawlStatistics;
    });
  }

  destroy() {
    this._removeEventHandlers();
  }
}
