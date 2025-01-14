import type { LiveAnchorCrawlerSettings } from '@tk-crawler/shared';
import { getLiveAnchorCrawlerSettings } from '../requests';

export default class GlobalStore {
  private _liveAnchorCrawlerSettings: LiveAnchorCrawlerSettings | null = null;

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
    window.ipcRenderer.on(event, listener);
  }

  private _addEventListeners() {
    // this._addEventListener(
    //   CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING,
    //   (_, settings) => this._setLiveAnchorCrawlerSettings(settings),
    // );
  }

  private _removeEventListeners() {
    this._eventListeners.forEach(([event, listener]) => {
      window.ipcRenderer.off(event, listener);
    });
    this._eventListeners = [];
  }

  async init() {
    this._addEventListeners();
    const settings = await getLiveAnchorCrawlerSettings();
    this._setLiveAnchorCrawlerSettings(settings);
  }

  clear() {
    this._liveAnchorCrawlerSettings = null;
    this._removeEventListeners();
  }
}
