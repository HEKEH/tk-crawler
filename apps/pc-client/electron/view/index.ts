import type { LiveAnchorCrawlerSetting } from '@tk-crawler/core';
import path from 'node:path';
import process from 'node:process';
import { BaseWindow, globalShortcut, ipcMain, WebContentsView } from 'electron';
import { CUSTOM_EVENTS } from '../constants';
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from '../env';
import { logger } from '../infra/logger';

export class ViewManager {
  private static _instance: ViewManager | undefined;
  private _baseWindow: BaseWindow | null = null;

  private _mainView: WebContentsView | null = null;

  // private _tkLiveManageView: BaseWindow | null = null;

  private constructor() {}

  private get baseWindow() {
    if (!this._baseWindow) {
      throw new Error('baseWindow is not initialized');
    }
    return this._baseWindow;
  }

  private get mainView() {
    if (!this._mainView) {
      throw new Error('MainView is not initialized');
    }
    return this._mainView;
  }

  async createWindow() {
    this._baseWindow = new BaseWindow({
      fullscreen: true,
      icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    });
    this._mainView = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
      },
    });

    // Test active push message to Renderer-process.
    this._mainView.webContents.on('did-finish-load', () => {
      // this._mainView?.webContents.send(
      //   'main-process-message',
      //   new Date().toLocaleString(),
      // );
      // if (isDevelopment) {
      globalShortcut.register('F12', () => {
        if (this._mainView?.webContents) {
          this._mainView.webContents.toggleDevTools();
        }
      });
      // }
    });
    if (VITE_DEV_SERVER_URL) {
      await this._mainView.webContents.loadURL(VITE_DEV_SERVER_URL);
    } else {
      // win.loadFile('dist/index.html')
      await this._mainView.webContents.loadFile(
        path.join(RENDERER_DIST, 'index.html'),
      );
    }
    const setBounds = () => {
      const bounds = this.baseWindow.getBounds();
      this._mainView?.setBounds({
        x: 0,
        y: 0,
        width: bounds.width,
        height: bounds.height,
      });
    };
    setBounds();
    this._baseWindow.contentView.addChildView(this._mainView);
    this._baseWindow.on('resize', setBounds);
    this._baseWindow.show();
  }

  destroy() {
    this._baseWindow?.removeAllListeners('resize');
    this._baseWindow?.close();
    this._baseWindow = null;
  }

  onLiveAnchorCrawlerSettingConfirmed(
    currentSetting: LiveAnchorCrawlerSetting,
    callback: (setting: LiveAnchorCrawlerSetting) => void,
  ) {
    this._mainView?.webContents.send(
      CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING,
      currentSetting,
    );
    ipcMain.on(
      CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING_CONFIRMED,
      (_, settings) => {
        logger.info(
          CUSTOM_EVENTS.LIVE_ANCHOR_CRAWLER_SETTING_CONFIRMED,
          settings,
        );
        callback(settings);
      },
    );
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new ViewManager();
    }
    return this._instance;
  }
}
