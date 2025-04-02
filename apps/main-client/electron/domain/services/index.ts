import type { ViewsManager } from '../views';
import { TIKTOK_LIVE_ADMIN_URL } from '@tk-crawler/biz-shared';
import {
  CheckNetworkResultType,
  CUSTOM_EVENTS,
  TOKEN_EVENTS,
} from '@tk-crawler/main-client-shared';
import { checkNetwork, type MessageCenter } from '@tk-crawler/shared';
import { ipcMain } from 'electron';
import { logger } from '../../infra/logger';
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
    this._addEventHandler(CUSTOM_EVENTS.GO_TO_COLLECT_PAGE, async () => {
      logger.info('[Switch TikTok Account]');
      return this._viewManager.openCollectPage();
    });
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
  }

  destroy() {
    this._removeEventHandlers();
  }
}
