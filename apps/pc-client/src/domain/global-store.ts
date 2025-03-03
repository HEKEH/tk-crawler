import type { LiveAnchorCrawlerSettings } from '@tk-crawler/shared';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import {
  getLiveAnchorCrawlerSettings,
  submitLiveAnchorCrawlerSettings,
} from '../requests';
import { Menu } from '../types';

export default class GlobalStore {
  private _currentMenu: Menu = Menu.Crawler;
  private _liveAnchorCrawlerSettings: LiveAnchorCrawlerSettings | null = null;

  get currentMenu() {
    return this._currentMenu;
  }

  get liveAnchorCrawlerSettings() {
    return this._liveAnchorCrawlerSettings;
  }

  private _eventListeners: Array<
    [string, (event: Electron.IpcRendererEvent, ...args: any[]) => void]
  > = [];

  private _setLiveAnchorCrawlerSettings(settings: LiveAnchorCrawlerSettings) {
    this._liveAnchorCrawlerSettings = settings;
  }

  private _addEventListener(
    event: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
  ) {
    this._eventListeners.push([event, listener]);
    ElectronRenderListeners.getInstance().on(event, listener);
  }

  private _addEventListeners() {
    // this._addEventListener(
    //   CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING,
    //   (_, settings) => this._setLiveAnchorCrawlerSettings(settings),
    // );
  }

  private _removeEventListeners() {
    this._eventListeners.forEach(([event, listener]) => {
      ElectronRenderListeners.getInstance().off(event, listener);
    });
    this._eventListeners = [];
  }

  async init() {
    this._addEventListeners();
    const settings = await getLiveAnchorCrawlerSettings();
    this._setLiveAnchorCrawlerSettings(settings);
  }

  async submitLiveAnchorCrawlerSetting(setting: LiveAnchorCrawlerSettings) {
    this._setLiveAnchorCrawlerSettings(setting);
    const res = await submitLiveAnchorCrawlerSettings(setting);
    if (res.success) {
      // TODO
    }
  }

  setCurrentMenu(menu: Menu) {
    this._currentMenu = menu;
  }

  clear() {
    this._liveAnchorCrawlerSettings = null;
    this._removeEventListeners();
  }
}
