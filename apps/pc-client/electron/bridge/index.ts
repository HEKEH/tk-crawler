import { Crawler } from '../domain';
import { initServices } from '../services';
import { ViewManager } from '../view';

/** 视图和爬虫之间的桥梁 */
export class Bridge {
  private static _instance: Bridge | null = null;
  private constructor() {}

  async start() {
    const crawler = Crawler.getInstance();
    ViewManager.getInstance().onLiveAnchorCrawlerSettingConfirmed(
      // 一旦设置确认，则启动爬虫
      setting => {
        crawler.start(setting);
      },
    );
    initServices();
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new Bridge();
    }
    return this._instance;
  }
}
