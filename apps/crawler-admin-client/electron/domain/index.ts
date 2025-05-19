import { setConfig } from '@tk-crawler/core';
import { MessageCenter } from '@tk-crawler/shared';
import config from '../config';
import { Crawler } from './crawler';
import { ErrorManager } from './error';
import { Services } from './services';
import { ViewsManager } from './views';

/** 领域的总入口 */
export class GlobalManager {
  private static _instance: GlobalManager | null = null;

  private _messageCenter: MessageCenter;

  private _crawler: Crawler;

  private _viewsManager: ViewsManager;
  private _errorManager: ErrorManager;

  private _services: Services;

  private constructor() {
    this._messageCenter = new MessageCenter();
    this._crawler = new Crawler({
      messageCenter: this._messageCenter,
    });
    this._viewsManager = new ViewsManager({
      messageCenter: this._messageCenter,
      onClose: () => {
        this.destroy();
      },
    });
    this._errorManager = new ErrorManager();
    this._services = new Services({
      messageCenter: this._messageCenter,
      crawler: this._crawler,
      viewManager: this._viewsManager,
      errorManager: this._errorManager,
    });
  }

  async start() {
    setConfig({
      ownServerUrl: config.ownServerUrl,
    });
    this._errorManager.init();
    this._services.init();
    this._viewsManager.init();
    await this._viewsManager.show();
  }

  destroy() {
    this._crawler.clear();
    this._errorManager.destroy();
    this._viewsManager.destroy();
    this._services.destroy();
    this._messageCenter.clear();
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new GlobalManager();
    }
    return this._instance;
  }
}
