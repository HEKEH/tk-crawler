import type { BaseWindow } from 'electron';
import type { IView } from './types';
import path from 'node:path';
import { initProxy } from '@tk-crawler/electron-utils/main';
import {
  LOGIN_HELP_WIDTH,
  LOGIN_TIKTOK_HELP_EVENTS,
  LOGIN_TIKTOK_STATUS,
} from '@tk-follow-client/shared';
import { ipcMain, WebContentsView } from 'electron';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { logger } from '../../infra/logger';

const TK_LOGIN_PAGE_URL = 'https://www.tiktok.com/login';

export interface TkLoginViewContext {
  onTikTokLoginConfirmed: () => Promise<void>;
}

export class TKLoginView implements IView {
  private _context: TkLoginViewContext;

  private _parentWindow: BaseWindow;

  private _tkPageView: WebContentsView | null = null;

  private _helpView: WebContentsView | null = null;

  private _status: LOGIN_TIKTOK_STATUS = LOGIN_TIKTOK_STATUS.stateless;

  private _openTurnId: number = 0;

  private _removeResizeListener: (() => void) | null = null;

  constructor(props: {
    parentWindow: BaseWindow;
    context: TkLoginViewContext;
  }) {
    this._parentWindow = props.parentWindow;
    this._context = props.context;
  }

  private _setStatus(status: LOGIN_TIKTOK_STATUS) {
    this._status = status;
    this._onResize();
  }

  private _onResize() {
    if (this._parentWindow.isDestroyed()) {
      return;
    }
    const bounds = this._parentWindow.getBounds();
    if (this._status === LOGIN_TIKTOK_STATUS.opened) {
      const sidebarWidth = Math.min(LOGIN_HELP_WIDTH, bounds.width);
      this._helpView?.setBounds({
        x: 0,
        y: 0,
        width: sidebarWidth,
        height: bounds.height,
      });
      this._tkPageView?.setBounds({
        x: sidebarWidth,
        y: 0,
        width: bounds.width - sidebarWidth,
        height: bounds.height,
      });
    } else {
      const viewBounds = {
        x: 0,
        y: 0,
        width: bounds.width,
        height: bounds.height,
      };
      this._helpView?.setBounds(viewBounds);
      this._tkPageView?.setBounds(viewBounds);
    }
  }

  private async _openHelpView() {
    if (!this._helpView) {
      this._helpView = new WebContentsView({
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
        },
      });
      if (VITE_DEV_SERVER_URL) {
        await this._helpView.webContents.loadURL(
          `${VITE_DEV_SERVER_URL}login-tiktok-help.html`,
        );
      } else {
        await this._helpView.webContents.loadFile(
          path.join(RENDERER_DIST, 'login-tiktok-help.html'),
        );
      }
      this._parentWindow.contentView.addChildView(this._helpView);
      this._onResize();
    }
  }

  private async _openTKPageView() {
    this._openTurnId++;
    const currentOpenTurnId = this._openTurnId;
    this._tkPageView = new WebContentsView();
    this._setStatus(LOGIN_TIKTOK_STATUS.loading);
    try {
      this._tkPageView.webContents.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      );
      // 加载目标网页
      await this._tkPageView.webContents.loadURL(TK_LOGIN_PAGE_URL);
      if (currentOpenTurnId !== this._openTurnId) {
        // 已过时
        return;
      }
      if (isDevelopment) {
        if (this._tkPageView?.webContents) {
          this._tkPageView.webContents.openDevTools({
            mode: 'right',
          });
        }
      }
      this._parentWindow.contentView.addChildView(this._tkPageView);
      this._setStatus(LOGIN_TIKTOK_STATUS.opened);
    } catch (error) {
      if ((error as any)?.code === 'ERR_CONNECTION_TIMED_OUT') {
        logger.error('Open tiktok login page timeout:', error);
        this._setStatus(LOGIN_TIKTOK_STATUS.timeout);
      } else {
        logger.error('Open tiktok login page error:', error);
        this._setStatus(LOGIN_TIKTOK_STATUS.fail);
      }
    }
  }

  private _closeView(view: WebContentsView) {
    const webContents = view.webContents;
    webContents.close();
    this._parentWindow.contentView.removeChildView(view);
  }

  private _closeTKPageView() {
    if (this._tkPageView) {
      this._closeView(this._tkPageView);
      this._tkPageView = null;
    }
  }

  private _closeHelpView() {
    if (this._helpView) {
      this._closeView(this._helpView);
      this._helpView = null;
    }
  }

  private async _reopenTKPageView() {
    this._closeTKPageView();
    await this._openTKPageView();
  }

  private _eventNames: Array<string> = [];

  private _addEventHandler(
    event: string,
    handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => void,
  ) {
    this._eventNames.push(event);
    ipcMain.handle(event, handler);
  }

  private _addEventHandlers() {
    this._addEventHandler(LOGIN_TIKTOK_HELP_EVENTS.GET_STATUS, () => {
      return this._status;
    });
    this._addEventHandler(
      LOGIN_TIKTOK_HELP_EVENTS.RETRY_OPEN_PAGE,
      async () => {
        await initProxy(logger);
        await this._reopenTKPageView();
      },
    );
    this._addEventHandler(
      LOGIN_TIKTOK_HELP_EVENTS.LOGIN_CONFIRMED,
      async () => {
        await this._context.onTikTokLoginConfirmed();
      },
    );
  }

  private _removeEventHandlers() {
    this._eventNames.forEach(event => {
      ipcMain.removeHandler(event);
    });
    this._eventNames = [];
  }

  async show() {
    try {
      this._addEventHandlers();
      const onResize = () => {
        this._onResize();
      };
      this._removeResizeListener = () => {
        this._parentWindow.removeListener('resize', onResize);
        this._removeResizeListener = null;
      };
      await this._openHelpView();
      await this._openTKPageView();
    } catch (error) {
      console.error('Error loading URL:', error);
    }
  }

  close() {
    this._removeResizeListener?.();
    this._removeEventHandlers();
    this._closeTKPageView();
    this._closeHelpView();
    this._setStatus(LOGIN_TIKTOK_STATUS.stateless);
  }

  destroy() {
    this.close();
  }
}
