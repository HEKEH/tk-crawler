import path from 'node:path';
import process from 'node:process';
import { BaseWindow, globalShortcut, WebContentsView } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { saveTiktokCookie } from '../services/cookie';
import { TkLoginPageWindow } from './tk-login-page-window';
import { bindViewToWindowBounds } from './utils';

export class ViewManager {
  private _baseWindow: BaseWindow | null = null;

  private _mainView: WebContentsView | null = null;

  private _tkLoginPageWindow: TkLoginPageWindow | null = null;

  // private _tkLiveManageView: BaseWindow | null = null;

  constructor() {}

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

  private get tkLoginPageWindow() {
    if (!this._tkLoginPageWindow) {
      throw new Error('TkLoginPageWindow is not initialized');
    }
    return this._tkLoginPageWindow;
  }

  async submitCookies(cookies: [string, string][]) {
    saveTiktokCookie(cookies);
    this.mainView.webContents.send(CUSTOM_EVENTS.TIKTOK_COOKIE_UPDATED);
  }

  async createWindow() {
    this._baseWindow = new BaseWindow({
      fullscreen: true,
      icon: path.join(process.env.VITE_PUBLIC, 'appicon.svg'),
    });
    this._mainView = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
      },
    });

    this._tkLoginPageWindow = new TkLoginPageWindow({ context: this });

    // Test active push message to Renderer-process.
    this._mainView.webContents.on('did-finish-load', () => {
      // this._mainView?.webContents.send(
      //   'main-process-message',
      //   new Date().toLocaleString(),
      // );
      if (isDevelopment) {
        if (this._mainView?.webContents) {
          this._mainView.webContents.openDevTools({
            mode: 'right',
          });
        }
      }
      globalShortcut.register('F12', () => {
        if (this._mainView?.webContents) {
          this._mainView.webContents.toggleDevTools();
        }
      });
    });
    if (VITE_DEV_SERVER_URL) {
      await this._mainView.webContents.loadURL(
        `${VITE_DEV_SERVER_URL}index.html`,
      );
    } else {
      await this._mainView.webContents.loadFile(
        path.join(RENDERER_DIST, 'index.html'),
      );
    }
    this._baseWindow.contentView.addChildView(this._mainView);
    bindViewToWindowBounds(this._mainView, this._baseWindow);
    this._baseWindow.show();
  }

  async openTkLoginPage() {
    await this.tkLoginPageWindow.open();
  }

  destroy() {
    this._baseWindow?.removeAllListeners('resize');
    this._baseWindow?.close();
    this._baseWindow = null;
    this._mainView?.webContents.close();
    this.tkLoginPageWindow.close();
  }
}
