import type { AnchorScrawledMessage } from '@tk-crawler/shared';
import { MessageCenter } from '@tk-crawler/shared';
import { CrawlerViewMessage, CUSTOM_EVENTS } from '../constants';
import {
  checkTiktokCookieValid,
  openTiktokLoginPage,
  startLiveAnchorCrawl,
  stopLiveAnchorCrawl,
} from '../services';
import { Menu } from '../types';
import { MessageQueue } from './message-queue';

export default class GlobalStore {
  private _currentMenu: Menu = Menu.Crawler;

  private _isInitialized: boolean = false;

  private _isTiktokCookieValid: boolean = false;
  private _isCrawling: boolean = false;

  private _notificationQueue = new MessageQueue({
    messageOffset: 200,
  });

  readonly messageCenter = new MessageCenter();

  get currentMenu() {
    return this._currentMenu;
  }

  get isInitialized() {
    return this._isInitialized;
  }

  get isCrawling() {
    return this._isCrawling;
  }

  get isTiktokCookieValid() {
    return this._isTiktokCookieValid;
  }

  private _eventListeners: Array<
    [string, (event: Electron.IpcRendererEvent, ...args: any[]) => void]
  > = [];

  private _addEventListener(
    event: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
  ) {
    this._eventListeners.push([event, listener]);
    window.ipcRenderer.on(event, listener);
  }

  private _addEventListeners() {
    this._addEventListener(CUSTOM_EVENTS.TIKTOK_COOKIE_UPDATED, () => {
      this._checkTiktokCookieValid();
    });
    this._addEventListener(CUSTOM_EVENTS.TIKTOK_COOKIE_OUTDATED, () => {
      this.messageCenter.emit(CrawlerViewMessage.TIKTOK_COOKIE_OUTDATED);
      this._isTiktokCookieValid = false;
    });
    this._addEventListener(
      CUSTOM_EVENTS.ANCHOR_SCRAWLED,
      (_, data: AnchorScrawledMessage) => {
        this._notificationQueue.showMessage({
          message: `抓取到主播${data.anchor.display_id}的信息`,
          type: 'success',
        });
      },
    );
  }

  private _removeEventListeners() {
    this._eventListeners.forEach(([event, listener]) => {
      window.ipcRenderer.off(event, listener);
    });
    this._eventListeners = [];
  }

  private async _checkTiktokCookieValid() {
    this._isInitialized = false;
    this._isTiktokCookieValid = await checkTiktokCookieValid();
    this._isInitialized = true;
  }

  async init() {
    this._addEventListeners();
    this._isTiktokCookieValid = await checkTiktokCookieValid();
    this._isInitialized = true;
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
