import { Crawler } from './crawler';
import { Services } from './services';
import { ViewManager } from './view';

/** 领域的总入口 */
export class GlobalManager {
  private static _instance: GlobalManager | null = null;

  private _crawler: Crawler;

  private _viewManager: ViewManager;

  private _services: Services;

  private constructor() {
    this._crawler = new Crawler();
    this._viewManager = new ViewManager();
    this._services = new Services({
      crawler: this._crawler,
    });
  }

  async start() {
    this._services.init();
    await this._viewManager.createWindow();
  }

  destroy() {
    this._crawler.stop();
    this._viewManager.destroy();
    this._services.destroy();
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new GlobalManager();
    }
    return this._instance;
  }
}
