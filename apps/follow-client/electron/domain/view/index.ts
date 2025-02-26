import type {
  AnchorScrawledMessage,
  MessageCenter,
  RequestErrorType,
} from '@tk-crawler/shared';
import type { Subscription } from 'rxjs';
import path from 'node:path';
import process from 'node:process';
import { CrawlerMessage } from '@tk-crawler/shared';
import { BaseWindow, globalShortcut, WebContentsView } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { saveTiktokCookie } from '../services/cookie';
import { TkLoginPageWindow } from './tk-pages-window';
import { bindViewToWindowBounds } from './utils';

export class ViewManager {
  private _baseWindow: BaseWindow | null = null;

  private _mainView: WebContentsView | null = null;

  private _tkLoginPageWindow: TkLoginPageWindow | null = null;

  private _messageCenter: MessageCenter;

  private _subscriptions: Subscription[] = [];

  constructor(props: { messageCenter: MessageCenter }) {
    this._messageCenter = props.messageCenter;
    this._subscriptions.push(
      this._messageCenter.addListener(
        CrawlerMessage.TIKTOK_COOKIE_OUTDATED,
        () => {
          this._onCookieOutdated();
        },
      ),
    );
    this._subscriptions.push(
      this._messageCenter.addListener(
        CrawlerMessage.ANCHOR_SCRAWLED,
        (data: AnchorScrawledMessage) => {
          this._onAnchorScrawled(data);
        },
      ),
    );
    this._subscriptions.push(
      this._messageCenter.addListener(
        CrawlerMessage.REQUEST_ERROR,
        (errorType: RequestErrorType) => {
          this._onRequestError(errorType);
        },
      ),
    );
  }

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

  async submitCookies(cookies: [string, string][] | string) {
    saveTiktokCookie(cookies);
    this.mainView.webContents.send(CUSTOM_EVENTS.TIKTOK_COOKIE_UPDATED);
  }

  private _onCookieOutdated() {
    this.mainView.webContents.send(CUSTOM_EVENTS.TIKTOK_COOKIE_OUTDATED);
  }

  private _onAnchorScrawled(data: AnchorScrawledMessage) {
    this.mainView.webContents.send(CUSTOM_EVENTS.ANCHOR_SCRAWLED, data);
  }

  private _onRequestError(errorType: RequestErrorType) {
    this.mainView.webContents.send(CUSTOM_EVENTS.REQUEST_ERROR, errorType);
  }

  async createWindow() {
    this._baseWindow = new BaseWindow({
      fullscreen: true,
      icon: path.join(process.env.VITE_PUBLIC, 'appicon.svg'),
    });
    this._mainView = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    this._tkLoginPageWindow = new TkLoginPageWindow({ context: this });

    // Test active push message to Renderer-process.
    this._mainView.webContents.on('did-finish-load', () => {
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

  private _clearSubscriptions() {
    this._subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this._subscriptions = [];
  }

  destroy() {
    this._clearSubscriptions();
    this._baseWindow?.removeAllListeners('resize');
    this._baseWindow?.close();
    this._baseWindow = null;
    this._mainView?.webContents.close();
    this.tkLoginPageWindow.close();
  }
}
