// import type { LiveAnchorCrawlerSettings } from '@tk-crawler/shared';
import { CUSTOM_EVENTS } from '../constants';
import {
  // getLiveAnchorCrawlerSettings,
  // submitLiveAnchorCrawlerSettings,
  checkTiktokCookieValid,
  openTiktokLoginPage,
} from '../services';
import { Menu } from '../types';

export default class GlobalStore {
  private _currentMenu: Menu = Menu.Crawler;

  private _isInitialized: boolean = false;

  private _isTiktokCookieValid: boolean = false;
  private _isCrawling: boolean = false;

  // private _liveAnchorCrawlerSettings: LiveAnchorCrawlerSettings | null = null;

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

  // get liveAnchorCrawlerSettings() {
  //   return this._liveAnchorCrawlerSettings;
  // }

  private _eventListeners: Array<
    [string, (event: Electron.IpcRendererEvent, ...args: any[]) => void]
  > = [];

  // private _setLiveAnchorCrawlerSettings(settings: LiveAnchorCrawlerSettings) {
  //   this._liveAnchorCrawlerSettings = settings;
  // }

  private _addEventListener(
    event: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
  ) {
    this._eventListeners.push([event, listener]);
    window.ipcRenderer.on(event, listener);
  }

  private _addEventListeners() {
    this._addEventListener(CUSTOM_EVENTS.TIKTOK_COOKIE_UPDATED, () => {
      console.log('tiktok cookie updated');
      this._checkTiktokCookieValid();
    });
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
    // const settings = await getLiveAnchorCrawlerSettings();
    // this._setLiveAnchorCrawlerSettings(settings);
  }

  // async submitLiveAnchorCrawlerSetting(setting: LiveAnchorCrawlerSettings) {
  //   this._setLiveAnchorCrawlerSettings(setting);
  //   const res = await submitLiveAnchorCrawlerSettings(setting);
  //   if (res.success) {
  //     // TODO
  //   }
  // }

  async loginTiktok() {
    await openTiktokLoginPage();
  }

  async start() {
    this._isCrawling = true;
  }

  async stop() {
    this._isCrawling = false;
  }

  setCurrentMenu(menu: Menu) {
    this._currentMenu = menu;
  }

  clear() {
    // this._liveAnchorCrawlerSettings = null;
    this._removeEventListeners();
  }
}
