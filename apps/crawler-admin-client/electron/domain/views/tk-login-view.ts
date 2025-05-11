import type { BaseWindow } from 'electron';
import type { IView } from './types';
import path from 'node:path';
import {
  LOGIN_HELP_WIDTH,
  LOGIN_TIKTOK_HELP_EVENTS,
  LOGIN_TIKTOK_STATUS,
} from '@tk-crawler-admin-client/shared';
import { initProxy } from '@tk-crawler/electron-utils/main';
import { ipcMain, WebContentsView } from 'electron';
import config from '../../config';
import { isDevelopment } from '../../env';
import { logger } from '../../infra/logger';
import { transformCookieString } from '../services/cookie';

const TK_LOGIN_PAGE_URL = 'https://www.tiktok.com/login';

export interface TkLoginViewContext {
  submitCookies: (cookies: [string, string][] | string) => Promise<void>;
  openMainView: () => void;
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

  private async _getCookies(): Promise<Electron.Cookie[]> {
    if (!this._tkPageView) {
      return [];
    }
    const session = this._tkPageView.webContents.session;
    try {
      const cookies = await session.cookies.get({});
      return cookies;
    } catch (error) {
      console.error('Failed to get cookies:', error);
      throw error;
    }
  }

  private async _submitCookies() {
    const cookies = await this._getCookies();
    await this._context.submitCookies(
      cookies.map(cookie => [cookie.name, cookie.value]),
    );
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

  // private _watchLoginSuccess(): void {
  //   if (!this._tkLoginPageView) {
  //     return;
  //   }
  //   const webContents = this._tkLoginPageView.webContents;

  //   // 附加调试器
  //   if (!webContents.debugger.isAttached()) {
  //     try {
  //       webContents.debugger.attach('1.3');
  //       webContents.debugger.sendCommand('Network.enable');

  //       const loginRequestIdSet = new Set<string>();
  //       const postRequestIdSet = new Set<string>();

  //       // 监听响应
  //       webContents.debugger.on('message', async (event, method, params) => {
  //         if (method === 'Network.requestWillBeSent') {
  //           const { requestId, request } = params;
  //           if (request.method === 'POST') {
  //             postRequestIdSet.add(requestId);
  //           }
  //         } else if (method === 'Network.responseReceived') {
  //           const { requestId, response } = params;
  //           // 检查是否是我们感兴趣的URL
  //           if (
  //             response.url.includes('/passport/web/user/login') &&
  //             response.status === 200 &&
  //             postRequestIdSet.has(requestId)
  //           ) {
  //             loginRequestIdSet.add(requestId);
  //           }
  //         } else if (method === 'Network.loadingFinished') {
  //           if (loginRequestIdSet.has(params.requestId)) {
  //             try {
  //               // 获取响应体
  //               const responseBody = await webContents.debugger.sendCommand(
  //                 'Network.getResponseBody',
  //                 { requestId: params.requestId },
  //               );
  //               const { body } = responseBody;
  //               if (typeof body === 'string' && body.startsWith('{')) {
  //                 const json = JSON.parse(body);
  //                 if (json.message === 'success') {
  //                   this._submitCookies();
  //                 }
  //               }
  //             } catch (err) {
  //               console.error('Failed to get response body:', err);
  //             }
  //           }
  //         }
  //       });
  //     } catch (err) {
  //       console.error('Failed to attach debugger:', err);
  //     }
  //   }
  // }

  private async _openHelpView() {
    if (!this._helpView) {
      this._helpView = new WebContentsView({
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
        },
      });
      // if (VITE_DEV_SERVER_URL) {
      //   await this._helpView.webContents.loadURL(
      //     `${VITE_DEV_SERVER_URL}login-tiktok-help.html`,
      //   );
      // } else {
      //   await this._helpView.webContents.loadFile(
      //     path.join(RENDERER_DIST, 'login-tiktok-help.html'),
      //   );
      // }
      await this._helpView.webContents.loadURL(
        `${config.adminWebUrl}login-tiktok-help.html`,
      );
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

      const maxRetries = 3; // 最多重试3次
      let retryCount = 0;
      while (retryCount < maxRetries) {
        try {
          await this._tkPageView.webContents.loadURL(TK_LOGIN_PAGE_URL);
          break;
        } catch (error) {
          logger.error('Error loading URL:', error, { retryCount });
          this._tkPageView.webContents.close();
          retryCount++;
          if (retryCount >= maxRetries) {
            throw error;
          }
        }
      }
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
    try {
      this._closeTKPageView();
      await this._openTKPageView();
    } catch (error) {
      logger.error('Error reopening tiktok login page:', error);
    }
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
    this._addEventHandler(
      LOGIN_TIKTOK_HELP_EVENTS.GET_LOGIN_TIKTOK_STATUS,
      () => {
        return this._status;
      },
    );
    this._addEventHandler(
      LOGIN_TIKTOK_HELP_EVENTS.RETRY_OPEN_TIKTOK_LOGIN_PAGE,
      async () => {
        await initProxy(logger);
        await this._reopenTKPageView();
      },
    );
    this._addEventHandler(LOGIN_TIKTOK_HELP_EVENTS.LOGIN_SUCCESS, () => {
      this._submitCookies();
    });
    this._addEventHandler(
      LOGIN_TIKTOK_HELP_EVENTS.SUBMIT_COOKIES,
      async (_, cookies: string) => {
        await this._context.submitCookies(cookies);
      },
    );
    this._addEventHandler(LOGIN_TIKTOK_HELP_EVENTS.BACK_HOME, () => {
      this._context.openMainView();
    });
    this._addEventHandler(LOGIN_TIKTOK_HELP_EVENTS.GET_COOKIE, async () => {
      const cookies = await this._getCookies();
      return transformCookieString(
        cookies.map(cookie => [cookie.name, cookie.value]),
      );
    });
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
      this._parentWindow.on('resize', onResize);
      this._removeResizeListener = () => {
        this._parentWindow.removeListener('resize', onResize);
      };
      await this._openHelpView();
      await this._openTKPageView();
    } catch (error) {
      logger.error('Error loading URL:', error);
    }
  }

  close() {
    this._removeResizeListener?.();
    this._removeResizeListener = null;
    this._removeEventHandlers();
    this._closeTKPageView();
    this._closeHelpView();
    this._setStatus(LOGIN_TIKTOK_STATUS.stateless);
  }

  destroy() {
    this.close();
  }
}
