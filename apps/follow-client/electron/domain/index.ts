import { MessageCenter } from '@tk-crawler/shared';
import { MainPageManagement } from './crawler';
import { Services } from './services';
import { ViewManager } from './view';

/** 领域的总入口 */
export class GlobalManager {
  private static _instance: GlobalManager | null = null;

  private _messageCenter: MessageCenter;

  private _mainPageManagement: MainPageManagement;

  private _viewManager: ViewManager;

  private _services: Services;

  private constructor() {
    this._messageCenter = new MessageCenter();
    this._mainPageManagement = new MainPageManagement({
      messageCenter: this._messageCenter,
    });
    this._viewManager = new ViewManager({
      messageCenter: this._messageCenter,
    });
    this._services = new Services({
      messageCenter: this._messageCenter,
      mainPageManagement: this._mainPageManagement,
      viewManager: this._viewManager,
    });
  }

  async start() {
    this._services.init();
    await this._viewManager.createWindow();
  }

  destroy() {
    this._mainPageManagement.clear();
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
