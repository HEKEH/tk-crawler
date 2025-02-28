import type {
  AnchorScrawledMessage,
  MessageCenter,
  RequestErrorType,
} from '@tk-crawler/shared';
import type { BaseWindow } from 'electron';
import type { Subscription } from 'rxjs';
import type { IView } from './types';
import path from 'node:path';
import { bindViewToWindowBounds } from '@tk-crawler/electron-utils';
import { CrawlerMessage } from '@tk-crawler/shared';
import { WebContentsView } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';

export class MainView implements IView {
  private _parentWindow: BaseWindow;

  private _view: WebContentsView | null = null;

  private _messageCenter: MessageCenter;

  private _subscriptions: Subscription[] = [];

  private _removeResizeListener: (() => void) | null = null;

  private _isVisible = true;

  constructor(props: {
    parentWindow: BaseWindow;
    messageCenter: MessageCenter;
  }) {
    this._parentWindow = props.parentWindow;
    this._messageCenter = props.messageCenter;
    this._subscriptions.push(
      this._messageCenter.addListener(
        CrawlerMessage.REQUEST_ERROR,
        (errorType: RequestErrorType) => {
          this._view?.webContents.send(CUSTOM_EVENTS.REQUEST_ERROR, errorType);
        },
      ),
      this._messageCenter.addListener(
        CrawlerMessage.TIKTOK_COOKIE_OUTDATED,
        () => {
          this._view?.webContents.send(CUSTOM_EVENTS.TIKTOK_COOKIE_OUTDATED);
        },
      ),
      this._messageCenter.addListener(
        CrawlerMessage.ANCHOR_SCRAWLED,
        (data: AnchorScrawledMessage) => {
          this._view?.webContents.send(CUSTOM_EVENTS.ANCHOR_SCRAWLED, data);
        },
      ),
    );
  }

  async show() {
    if (this._view && !this._isVisible) {
      this._view.setVisible(true);
      this._isVisible = true;
      this._bindResizeListener();
      return;
    }
    this._view = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    // Test active push message to Renderer-process.
    this._view.webContents.on('did-finish-load', () => {
      if (isDevelopment) {
        if (this._view?.webContents) {
          this._view.webContents.openDevTools({
            mode: 'right',
          });
        }
      }
      // globalShortcut.register('F12', () => {
      //   if (this._view?.webContents) {
      //     this._view.webContents.toggleDevTools();
      //   }
      // });
    });
    if (VITE_DEV_SERVER_URL) {
      await this._view.webContents.loadURL(`${VITE_DEV_SERVER_URL}index.html`);
    } else {
      await this._view.webContents.loadFile(
        path.join(RENDERER_DIST, 'index.html'),
      );
    }
    this._parentWindow.contentView.addChildView(this._view);
    this._bindResizeListener();
  }

  private _bindResizeListener() {
    if (this._view) {
      const removeResizeListener = bindViewToWindowBounds(
        this._view,
        this._parentWindow,
      );
      this._removeResizeListener = () => {
        removeResizeListener();
        this._removeResizeListener = null;
      };
    }
  }

  private _clearSubscriptions() {
    this._subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this._subscriptions = [];
  }

  onCookiesUpdated() {
    this._view?.webContents.send(CUSTOM_EVENTS.TIKTOK_COOKIE_UPDATED);
  }

  /** 只是隐藏视图，不销毁 */
  close() {
    if (this._view) {
      this._view.setVisible(false);
      this._isVisible = false;
      this._removeResizeListener?.();
    }
  }

  destroy() {
    this._clearSubscriptions();
    this._removeResizeListener?.();
    if (this._view) {
      this._view.webContents.close();
      this._parentWindow.contentView.removeChildView(this._view);
      this._view = null;
    }
  }
}
