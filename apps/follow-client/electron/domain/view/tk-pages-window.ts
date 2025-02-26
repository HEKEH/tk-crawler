import path from 'node:path';
import { BaseWindow, ipcMain, WebContentsView } from 'electron';
import {
  LOGIN_HELP_WIDTH,
  LOGIN_TIKTOK_HELP_EVENTS,
  LOGIN_TIKTOK_STATUS,
} from '../../constants';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { logger } from '../../infra/logger';

const TK_LOGIN_PAGE_URL = 'https://www.tiktok.com/login';

interface TkLoginPageWindowContext {
  submitCookies: (cookies: [string, string][] | string) => Promise<void>;
}

export class TkLoginPageWindow {
  private _context: TkLoginPageWindowContext;

  private _tkPagesWindow: BaseWindow | null = null;

  private _tkPagesView: WebContentsView | null = null;

  // 登录状态view
  private _tkPagesHelpView: WebContentsView | null = null;

  private _loginStatus: LOGIN_TIKTOK_STATUS = LOGIN_TIKTOK_STATUS.stateless;

  private _openTurnId: number = 0;

  constructor(props: { context: TkLoginPageWindowContext }) {
    this._context = props.context;
  }

  private async _getCookies(): Promise<Electron.Cookie[]> {
    if (!this._tkPagesView) {
      return [];
    }

    const session = this._tkPagesView.webContents.session;
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
    this.close();
  }

  private _setLoginStatus(status: LOGIN_TIKTOK_STATUS) {
    this._loginStatus = status;
    this._onResize();
  }

  private _onResize() {
    if (!this._tkPagesWindow) {
      return;
    }
    const bounds = this._tkPagesWindow.getBounds();
    if (this._loginStatus === LOGIN_TIKTOK_STATUS.opened) {
      this._tkPagesHelpView?.setBounds({
        x: 0,
        y: 0,
        width: LOGIN_HELP_WIDTH,
        height: bounds.height,
      });
      this._tkPagesView?.setBounds({
        x: LOGIN_HELP_WIDTH,
        y: 0,
        width: bounds.width - LOGIN_HELP_WIDTH,
        height: bounds.height,
      });
    } else {
      const viewBounds = {
        x: 0,
        y: 0,
        width: bounds.width,
        height: bounds.height,
      };
      this._tkPagesHelpView?.setBounds(viewBounds);
      this._tkPagesView?.setBounds(viewBounds);
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

  private async _initLoginHelpView() {
    if (!this._tkPagesHelpView) {
      this._tkPagesHelpView = new WebContentsView({
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
        },
      });
      if (VITE_DEV_SERVER_URL) {
        await this._tkPagesHelpView.webContents.loadURL(
          `${VITE_DEV_SERVER_URL}tiktok-pages-help.html`,
        );
      } else {
        await this._tkPagesHelpView.webContents.loadFile(
          path.join(RENDERER_DIST, 'tiktok-pages-help.html'),
        );
      }
      this._tkPagesWindow!.contentView.addChildView(this._tkPagesHelpView);
      this._onResize();
    }
  }

  private _closeLoginView() {
    if (this._tkPagesView) {
      const webContents = this._tkPagesView.webContents;
      webContents.debugger.detach();
      webContents.close();
      this._tkPagesWindow?.contentView.removeChildView(this._tkPagesView);
      this._tkPagesView = null;
    }
  }

  private _loadThirdPartyURL(view: WebContentsView, url: string) {
    view.webContents.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    );
    view.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        try {
          const {
            'Content-Security-Policy': csp1,
            'content-security-policy': csp2,
            ...others
          } = details.responseHeaders || {};

          if (csp1 || csp2) {
            callback({
              responseHeaders: {
                ...others, // 保留所有原始响应头
                'Content-Security-Policy': [
                  `default-src * 'unsafe-inline' 'unsafe-eval'`,
                ],
              },
            });
          } else {
            callback({
              responseHeaders: details.responseHeaders,
            });
          }
        } catch (error) {
          // 发生错误时也要调用callback
          logger.error('Handle response headers error:', error);
          callback({ responseHeaders: details.responseHeaders });
        }
      },
    );
    return view.webContents.loadURL(url);
  }

  private async _clickButton(view: WebContentsView, selector: string) {
    const result = await view.webContents.executeJavaScript(`
        (function() {
          console.log('click button', '${selector}');
          // try {
          //   const button = document.querySelector('${selector}');
          //   if (button) {
          //     button.click();
          //     return { success: true };
          //   }
          //   return { success: false, error: 'Button not found' };
          // } catch (error) {
          //   return { success: false, error: error.message };
          // }
        })()
      `);
    return result;
  }

  private async _openLoginView() {
    this._openTurnId++;
    const currentOpenTurnId = this._openTurnId;
    this._tkPagesView = new WebContentsView();
    this._setLoginStatus(LOGIN_TIKTOK_STATUS.loading);
    try {
      // 加载目标网页
      await this._loadThirdPartyURL(this._tkPagesView, TK_LOGIN_PAGE_URL);

      setTimeout(() => {
        this._clickButton(this._tkPagesView!, '#login-button');
      }, 1000);

      if (currentOpenTurnId !== this._openTurnId) {
        // 已过时
        return;
      }
      if (!this._tkPagesWindow) {
        return;
      }
      if (isDevelopment) {
        if (this._tkPagesView?.webContents) {
          this._tkPagesView.webContents.openDevTools({
            mode: 'right',
          });
        }
      }
      this._tkPagesWindow.contentView.addChildView(this._tkPagesView);
      this._setLoginStatus(LOGIN_TIKTOK_STATUS.opened);
      // this._watchLoginSuccess();
    } catch (error) {
      if ((error as any)?.code === 'ERR_CONNECTION_TIMED_OUT') {
        logger.error('Open tiktok login page timeout:', error);
        this._setLoginStatus(LOGIN_TIKTOK_STATUS.timeout);
      } else {
        logger.error('Open tiktok login page error:', error);
        this._setLoginStatus(LOGIN_TIKTOK_STATUS.fail);
      }
    }
  }

  private async _reopenLoginView() {
    this._closeLoginView();
    await this._openLoginView();
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
        return this._loginStatus;
      },
    );
    this._addEventHandler(
      LOGIN_TIKTOK_HELP_EVENTS.RETRY_OPEN_TIKTOK_LOGIN_PAGE,
      async () => {
        await this._reopenLoginView();
      },
    );
    this._addEventHandler(LOGIN_TIKTOK_HELP_EVENTS.LOGIN_SUCCESS, () => {
      this._submitCookies();
    });
    this._addEventHandler(
      LOGIN_TIKTOK_HELP_EVENTS.SUBMIT_COOKIES,
      async (_, cookies: string) => {
        await this._context.submitCookies(cookies);
        this.close();
      },
    );
  }

  private _removeEventHandlers() {
    this._eventNames.forEach(event => {
      ipcMain.removeHandler(event);
    });
    this._eventNames = [];
  }

  async open() {
    if (this._tkPagesWindow && !this._tkPagesWindow.isDestroyed()) {
      this.close();
    }
    try {
      this._addEventHandlers();
      this._tkPagesWindow = new BaseWindow({
        fullscreen: true,
      });
      this._tkPagesWindow.on('resize', () => {
        this._onResize();
      });
      this._tkPagesWindow.on('close', () => {
        this.close();
      });
      await this._initLoginHelpView();
      await this._openLoginView();
    } catch (error) {
      console.error('Error loading URL:', error);
    }
  }

  close() {
    this._removeEventHandlers();
    this._closeLoginView();
    if (this._tkPagesHelpView) {
      const webContents = this._tkPagesHelpView.webContents;
      webContents.close();
      this._tkPagesWindow?.contentView.removeChildView(this._tkPagesHelpView);
      this._tkPagesHelpView = null;
    }
    if (this._tkPagesWindow) {
      this._tkPagesWindow.removeAllListeners('resize');
      this._tkPagesWindow.removeAllListeners('close');
      this._tkPagesWindow.close();
      this._tkPagesWindow = null;
    }
    this._setLoginStatus(LOGIN_TIKTOK_STATUS.stateless);
  }
}
