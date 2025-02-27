import type { MessageCenter, RequestErrorType } from '@tk-crawler/shared';
import type { BaseWindow } from 'electron';
import type { Subscription } from 'rxjs';
import type { IView } from './types';
import path from 'node:path';
import { CrawlerMessage } from '@tk-crawler/shared';
import { WebContentsView } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { bindViewToWindowBounds } from './utils';

export class MainView implements IView {
  private _parentWindow: BaseWindow;

  private _view: WebContentsView | null = null;

  private _messageCenter: MessageCenter;

  private _subscriptions: Subscription[] = [];

  private _removeResizeListener: (() => void) | null = null;

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
          this._onRequestError(errorType);
        },
      ),
    );
  }

  private _onRequestError(errorType: RequestErrorType) {
    this._view?.webContents.send(CUSTOM_EVENTS.REQUEST_ERROR, errorType);
  }

  async show() {
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
    this._removeResizeListener = bindViewToWindowBounds(
      this._view,
      this._parentWindow,
    );
  }

  private _clearSubscriptions() {
    this._subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this._subscriptions = [];
  }

  close() {
    this._removeResizeListener?.();
    this._removeResizeListener = null;
    if (this._view) {
      this._view.webContents.close();
      this._parentWindow.contentView.removeChildView(this._view);
      this._view = null;
    }
  }

  destroy() {
    this._clearSubscriptions();
    this.close();
  }
}
