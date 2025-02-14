import { MessageCenter } from '@tk-crawler/shared';
import { Crawler } from './crawler';
import { Services } from './services';
import { ViewManager } from './view';

/** 领域的总入口 */
export class GlobalManager {
  private static _instance: GlobalManager | null = null;

  private _messageCenter: MessageCenter;

  private _crawler: Crawler;

  private _viewManager: ViewManager;

  private _services: Services;

  private constructor() {
    this._messageCenter = new MessageCenter();
    this._crawler = new Crawler({
      messageCenter: this._messageCenter,
    });
    this._viewManager = new ViewManager({
      messageCenter: this._messageCenter,
    });
    this._services = new Services({
      crawler: this._crawler,
      viewManager: this._viewManager,
    });
  }

  async start() {
    this._services.init();
    await this._viewManager.createWindow();
  }

  destroy() {
    this._crawler.clear();
    this._viewManager.destroy();
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
