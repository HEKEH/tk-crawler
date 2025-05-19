import type { TKGuildUser } from '@tk-crawler/biz-shared';
import type { ViewsManager } from '../views';
import {
  GUILD_COOKIE_PAGE_HELP_EVENTS,
  TIKTOK_LIVE_ADMIN_URL,
  TK_GUILD_USER_EVENTS,
} from '@tk-crawler/biz-shared';
import { getTrayManager } from '@tk-crawler/electron-utils/main';
import {
  CheckNetworkResultType,
  CUSTOM_EVENTS,
  TOKEN_EVENTS,
} from '@tk-crawler/main-client-shared';
import { checkNetwork, type MessageCenter } from '@tk-crawler/shared';
import { ipcMain } from 'electron';
import { logger } from '../../infra';
import { getToken, removeToken, saveToken } from './token';

export class Services {
  private _viewManager: ViewsManager;

  private _messageCenter: MessageCenter;

  private _eventNames: Array<string> = [];
  constructor({
    viewManager,
    messageCenter,
  }: {
    viewManager: ViewsManager;
    messageCenter: MessageCenter;
  }) {
    this._viewManager = viewManager;
    this._messageCenter = messageCenter;
  }

  // private async _startCrawl(): Promise<CommonResult<void>> {
  //   try {
  //     await this._crawler.start();
  //     return {
  //       success: true,
  //     };
  //   } catch (error) {
  //     logger.error('Failed to start live anchor crawl', error);
  //     return {
  //       success: false,
  //       message: error instanceof Error ? error.message : 'Unknown error',
  //     };
  //   }
  // }

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
    this._addEventHandler(CUSTOM_EVENTS.CHECK_NETWORK, async () => {
      const res = await checkNetwork(TIKTOK_LIVE_ADMIN_URL);
      logger.info('[checkNetwork]', res);
      // 如果有必要可以再细分
      return res
        ? CheckNetworkResultType.SUCCESS
        : CheckNetworkResultType.ERROR;
    });
    this._addEventHandler(TOKEN_EVENTS.GET_TOKEN, getToken);
    this._addEventHandler(TOKEN_EVENTS.SET_TOKEN, (_, token) =>
      saveToken(token),
    );
    this._addEventHandler(TOKEN_EVENTS.REMOVE_TOKEN, removeToken);
    this._addEventHandler(
      TK_GUILD_USER_EVENTS.IS_ANY_GUILD_USER_ERROR,
      (_, hasError: boolean) => {
        const trayManager = getTrayManager();
        if (hasError) {
          trayManager.showShining();
        } else {
          trayManager.showNormal();
        }
      },
    );
  }

  destroy() {
    this._removeEventHandlers();
  }
}
