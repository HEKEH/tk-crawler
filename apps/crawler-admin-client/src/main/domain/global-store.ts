import { IsCookieValidResultStatus } from '@tk-crawler-admin-client/shared';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import { MessageCenter } from '@tk-crawler/shared';
import { markRaw } from 'vue';
import { CrawlerViewMessage, CUSTOM_EVENTS } from '../constants';
import {
  checkTiktokCookieValid,
  openTiktokLoginPage,
  startLiveAnchorCrawl,
  stopLiveAnchorCrawl,
} from '../services';
import { Menu } from '../types';

export default class GlobalStore {
  private _currentMenu: Menu = Menu.Crawler;

  private _isInitialized: boolean = false;

  private _tiktokCookieValidStatus: IsCookieValidResultStatus =
    IsCookieValidResultStatus.FAILED;

  private _isCrawling: boolean = false;

  readonly messageCenter = markRaw(new MessageCenter());

  get currentMenu() {
    return this._currentMenu;
  }

  get isInitialized() {
    return this._isInitialized;
  }

  get isCrawling() {
    return this._isCrawling;
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
      this.messageCenter.emit(CrawlerViewMessage.TIKTOK_COOKIE_OUTDATED);
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
    this._isInitialized = false;
    this._tiktokCookieValidStatus = await checkTiktokCookieValid();
    this._isInitialized = true;
  }

  async init() {
    this._addEventListeners();
    await this.checkTiktokCookieValid();
  }

  async loginTiktok() {
    await openTiktokLoginPage();
  }

  async start() {
    this._isCrawling = true;
    const result = await startLiveAnchorCrawl();
    if (!result.success) {
      this._isCrawling = false;
      throw new Error(result.message);
    }
  }

  async stop() {
    this._isCrawling = false;
    const result = await stopLiveAnchorCrawl();
    if (!result.success) {
      throw new Error(result.message);
    }
  }

  setCurrentMenu(menu: Menu) {
    this._currentMenu = menu;
  }

  clear() {
    this._removeEventListeners();
  }
}
