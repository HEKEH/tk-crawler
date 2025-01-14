import { Crawler } from '../domain';
import { ViewManager } from '../view';

/** 视图和爬虫之间的桥梁 */
export class Bridge {
  private static _instance: Bridge | null = null;
  private constructor() {}

  async start() {
    const crawler = Crawler.getInstance();
    const currentSetting = await crawler.getCurrentLiveAnchorCrawlerSetting();
    ViewManager.getInstance().onLiveAnchorCrawlerSettingConfirmed(
      currentSetting,
      // 一旦设置确认，则启动爬虫
      setting => {
        crawler.start(setting);
      },
    );
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new Bridge();
    }
    return this._instance;
  }
}
