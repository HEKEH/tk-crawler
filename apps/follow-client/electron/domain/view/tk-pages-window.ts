import path from 'node:path';
import { BaseWindow, ipcMain, WebContentsView } from 'electron';
import {
  TIKTOK_PAGES_HELP_EVENTS,
  TIKTOK_PAGES_HELP_WIDTH,
  TIKTOK_PAGES_STATUS,
} from '../../constants';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { logger } from '../../infra/logger';

const TK_LOGIN_PAGE_URL = 'https://www.tiktok.com/login';

export class TkPagesWindow {
  private _tkPagesWindow: BaseWindow | null = null;

  private _tkPagesView: WebContentsView | null = null;

  // 登录状态view
  private _tkPagesHelpView: WebContentsView | null = null;

  private _status: TIKTOK_PAGES_STATUS = TIKTOK_PAGES_STATUS.stateless;

  private _openTurnId: number = 0;

  constructor() {}

  private _setStatus(status: TIKTOK_PAGES_STATUS) {
    this._status = status;
    this._onResize();
  }

  private _onResize() {
    if (!this._tkPagesWindow) {
      return;
    }
    const bounds = this._tkPagesWindow.getBounds();
    if (this._status === TIKTOK_PAGES_STATUS.opened) {
      this._tkPagesHelpView?.setBounds({
        x: 0,
        y: 0,
        width: TIKTOK_PAGES_HELP_WIDTH,
        height: bounds.height,
      });
      this._tkPagesView?.setBounds({
        x: TIKTOK_PAGES_HELP_WIDTH,
        y: 0,
        width: bounds.width - TIKTOK_PAGES_HELP_WIDTH,
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

  private async _clickElement(
    view: WebContentsView,
    selector: string,
  ): Promise<{ success: boolean; error?: string }> {
    const result = await view.webContents.executeJavaScript(`
        (function() {
          console.log('click element', '${selector}');
          try {
            const element = document.querySelector('${selector}');
            if (element) {
              element.click();
              return { success: true };
            }
            return { success: false, error: 'Element not found' };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `);
    return result;
  }

  private async _openLoginView() {
    this._openTurnId++;
    const currentOpenTurnId = this._openTurnId;
    this._tkPagesView = new WebContentsView();
    this._setStatus(TIKTOK_PAGES_STATUS.loading);
    try {
      // 加载目标网页
      await this._loadThirdPartyURL(this._tkPagesView, TK_LOGIN_PAGE_URL);

      setTimeout(async () => {
        const res = await this._clickElement(
          this._tkPagesView!,
          'span[data-e2e="bottom-sign-up"]',
        );
        console.log('click element result:', res);
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
      this._setStatus(TIKTOK_PAGES_STATUS.opened);
      // this._watchLoginSuccess();
    } catch (error) {
      if ((error as any)?.code === 'ERR_CONNECTION_TIMED_OUT') {
        logger.error('Open tiktok login page timeout:', error);
        this._setStatus(TIKTOK_PAGES_STATUS.timeout);
      } else {
        logger.error('Open tiktok login page error:', error);
        this._setStatus(TIKTOK_PAGES_STATUS.fail);
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
      TIKTOK_PAGES_HELP_EVENTS.GET_LOGIN_TIKTOK_STATUS,
      () => {
        return this._status;
      },
    );
    this._addEventHandler(
      TIKTOK_PAGES_HELP_EVENTS.RETRY_OPEN_TIKTOK_PAGE,
      async () => {
        await this._reopenLoginView();
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
    this._setStatus(TIKTOK_PAGES_STATUS.stateless);
  }
}
