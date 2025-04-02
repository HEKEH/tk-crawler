import type { MessageCenter } from '@tk-crawler/shared';
import type { ViewsManager } from '../views';
import { CheckNetworkResultType } from '@tk-mobile-follow-client/shared';
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
    this._addEventHandler(CUSTOM_EVENTS.GO_TO_COLLECT_PAGE, async () => {
      logger.info('[Go To Collect Page]');
      return this._viewManager.openCollectPage();
    });
    this._addEventHandler(CUSTOM_EVENTS.CHECK_NETWORK, async () => {
      // 当前场景不需要检查tiktok网络
      return CheckNetworkResultType.SUCCESS;
      // const res = await checkNetwork(TK_URL);
      // logger.info('[checkNetwork]', res);
      // // 如果有必要可以再细分
      // return res
      //   ? CheckNetworkResultType.SUCCESS
      //   : CheckNetworkResultType.ERROR;
    });
  }

  destroy() {
    this._removeEventHandlers();
  }
}
