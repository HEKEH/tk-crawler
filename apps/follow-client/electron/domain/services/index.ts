import type { MainPageManagement } from '../crawler';
import type { ViewManager } from '../view';
import { checkNetwork, type MessageCenter } from '@tk-crawler/shared';
import { CheckNetworkResultType, TK_URL } from '@tk-follow-client/shared';
import { ipcMain } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { logger } from '../../infra/logger';

export class Services {
  private _mainPageManagement: MainPageManagement;
  private _viewManager: ViewManager;

  private _messageCenter: MessageCenter;

  private _eventNames: Array<string> = [];
  constructor({
    mainPageManagement,
    viewManager,
    messageCenter,
  }: {
    mainPageManagement: MainPageManagement;
    viewManager: ViewManager;
    messageCenter: MessageCenter;
  }) {
    this._mainPageManagement = mainPageManagement;
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

  // private _stopCrawl() {
  //   try {
  //     this._crawler.stop();
  //     return {
  //       success: true,
  //     };
  //   } catch (error) {
  //     logger.error('Failed to stop live anchor crawl', error);
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
      CUSTOM_EVENTS.START_EXECUTE,
      (_, userIds: string[]) => {
        logger.info('[startExecute]', userIds);
        return this._viewManager.startExecute();
      },
    );
    this._addEventHandler(CUSTOM_EVENTS.CHECK_NETWORK, async () => {
      const res = await checkNetwork(TK_URL);
      logger.info('[checkNetwork]', res);
      // 如果有必要可以再细分
      return res
        ? CheckNetworkResultType.SUCCESS
        : CheckNetworkResultType.ERROR;
    });
    // this._addEventHandler(CUSTOM_EVENTS.START_LIVE_ANCHOR_CRAWL, () => {
    //   return this._startCrawl();
    // });
    // this._addEventHandler(CUSTOM_EVENTS.STOP_LIVE_ANCHOR_CRAWL, () => {
    //   return this._stopCrawl();
    // });
  }

  destroy() {
    this._removeEventHandlers();
  }
}
