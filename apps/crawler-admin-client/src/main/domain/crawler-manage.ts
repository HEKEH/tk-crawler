import type {
  SimpleCrawlStatistics,
} from '@tk-crawler/biz-shared';
import {
  CRAWL_EVENTS,
  IsCookieValidResultStatus,
} from '@tk-crawler-admin-client/shared';
import { CrawlStatus } from '@tk-crawler/biz-shared';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import { ElNotification } from 'element-plus';
import { markRaw } from 'vue';
import { CUSTOM_EVENTS } from '../constants';
import {
  checkTiktokCookieValid,
  openTiktokLoginPage,
  recheckTiktokCookieValid,
  startLiveAnchorCrawl,
  stopLiveAnchorCrawl,
} from '../requests';

export default class CrawlerManage {
  private _isCookieChecked: boolean = false;

  private _isInitialized: boolean = false;

  private _tiktokCookieValidStatus: IsCookieValidResultStatus =
    IsCookieValidResultStatus.FAILED;

  private _crawlStatus: CrawlStatus = CrawlStatus.STOPPED;

  private _crawlStatusInterval: NodeJS.Timeout | null = null;

  private _simpleCrawlStatistics: SimpleCrawlStatistics = {
    anchorUpdateTimes: 0,
    crawlStartTime: undefined,
    feedNumber: 0,
  };

  get isCookieChecked() {
    return this._isCookieChecked;
  }

  get simpleCrawlStatistics() {
    return this._simpleCrawlStatistics;
  }

  async updateSimpleCrawlStatistics() {
    const simpleCrawlStatistics = await window.ipcRenderer.invoke(
      CRAWL_EVENTS.GET_SIMPLE_CRAWL_STATISTICS,
    );
    this._simpleCrawlStatistics = simpleCrawlStatistics;
  }

  clearSimpleCrawlStatistics() {
    this._simpleCrawlStatistics = {
      anchorUpdateTimes: 0,
      crawlStartTime: undefined,
      feedNumber: 0,
    };
  }

  get crawlStatus() {
    return this._crawlStatus;
  }

  get tiktokCookieValidStatus() {
    return this._tiktokCookieValidStatus;
  }

  private _eventListeners: Array<
    [string, (event: Electron.IpcRendererEvent, ...args: any[]) => void]
  > = [];

  private _addEventListener(
    event: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
  ) {
    this._eventListeners.push([event, listener]);
    ElectronRenderListeners.getInstance().on(event, listener);
  }

  private _addEventListeners() {
    this._addEventListener(CUSTOM_EVENTS.TIKTOK_COOKIE_UPDATED, async () => {
      await this.checkTiktokCookieValid();
    });
    this._addEventListener(CUSTOM_EVENTS.TIKTOK_COOKIE_OUTDATED, () => {
      ElNotification.error({
        message: 'Tiktok cookie已过期，请重新登录',
      });
      this._tiktokCookieValidStatus = IsCookieValidResultStatus.FAILED;
    });
  }

  private _removeEventListeners() {
    this._eventListeners.forEach(([event, listener]) => {
      ElectronRenderListeners.getInstance().off(event, listener);
    });
    this._eventListeners = [];
  }

  async checkTiktokCookieValid() {
    this._isCookieChecked = false;
    this._tiktokCookieValidStatus = await checkTiktokCookieValid();
    this._isCookieChecked = true;
  }

  async recheckTiktokCookieValid() {
    this._isCookieChecked = false;
    this._tiktokCookieValidStatus = await recheckTiktokCookieValid();
    this._isCookieChecked = true;
  }

  async init() {
    if (this._isInitialized) {
      return;
    }
    this._isInitialized = true;
    this._addEventListeners();
    // 实时监控crawl状态
    this._crawlStatusInterval = setInterval(
      () => this._refreshCrawlStatus(),
      200,
    );
    await this.checkTiktokCookieValid();
  }

  async loginTiktok() {
    await openTiktokLoginPage();
  }

  private async _refreshCrawlStatus() {
    const ipcRenderer = markRaw(window.ipcRenderer);
    if (ipcRenderer) {
      this._crawlStatus = await ipcRenderer.invoke(
        CRAWL_EVENTS.GET_CRAWL_STATUS,
      );
    }
  }

  async start() {
    const result = await startLiveAnchorCrawl();
    if (!result.success) {
      throw new Error(result.message);
    }
  }

  async stop() {
    const result = await stopLiveAnchorCrawl();
    if (!result.success) {
      throw new Error(result.message);
    }
    this.clearSimpleCrawlStatistics();
  }

  async destroy() {
    this._removeEventListeners();
    await this.stop();
    if (this._crawlStatusInterval) {
      clearInterval(this._crawlStatusInterval);
      this._crawlStatusInterval = null;
    }
    this._isInitialized = false;
  }
}
