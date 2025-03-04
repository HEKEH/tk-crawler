import type { ViewsManager } from '../views';
import { checkNetwork, type MessageCenter } from '@tk-crawler/shared';
import { CheckNetworkResultType, TK_URL } from '@tk-ios-follow-client/shared';
import { ipcMain } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { logger } from '../../infra/logger';

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
      CUSTOM_EVENTS.START_AUTO_FOLLOW,
      (_, userIds: string[]) => {
        logger.info('[Start Auto Follow]', userIds);
        return this._viewManager.startAutoFollow(userIds);
      },
    );
    this._addEventHandler(CUSTOM_EVENTS.SWITCH_TIKTOK_ACCOUNT, async () => {
      logger.info('[Switch TikTok Account]');
      return this._viewManager.openTKLoginPage();
    });
    this._addEventHandler(CUSTOM_EVENTS.CHECK_NETWORK, async () => {
      const res = await checkNetwork(TK_URL);
      logger.info('[checkNetwork]', res);
      // 如果有必要可以再细分
      return res
        ? CheckNetworkResultType.SUCCESS
        : CheckNetworkResultType.ERROR;
    });
  }

  destroy() {
    this._removeEventHandlers();
  }
}
