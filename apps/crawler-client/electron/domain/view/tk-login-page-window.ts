import { BaseWindow, WebContentsView } from 'electron';
import { isDevelopment } from '../../env';
import { bindViewToWindowBounds } from './utils';

const TK_LOGIN_PAGE_URL = 'https://www.tiktok.com/login';

interface TkLoginPageWindowContext {
  submitCookies: (cookies: [string, string][]) => Promise<void>;
}

export class TkLoginPageWindow {
  private _context: TkLoginPageWindowContext;

  private _tkLoginPageWindow: BaseWindow | null = null;

  private _tkLoginPageView: WebContentsView | null = null;

  private _loadingView: WebContentsView | null = null;

  private _openTurnId: number = 0;

  constructor(props: { context: TkLoginPageWindowContext }) {
    this._context = props.context;
  }

  private async _getCookies(): Promise<Electron.Cookie[]> {
    if (!this._tkLoginPageView) {
      return [];
    }

    const session = this._tkLoginPageView.webContents.session;
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

  private _watchLoginSuccess(): void {
    if (!this._tkLoginPageView) {
      return;
    }
    const webContents = this._tkLoginPageView.webContents;

    // 附加调试器
    if (!webContents.debugger.isAttached()) {
      try {
        webContents.debugger.attach('1.3');
        webContents.debugger.sendCommand('Network.enable');

        const loginRequestIdSet = new Set<string>();
        const postRequestIdSet = new Set<string>();

        // 监听响应
        webContents.debugger.on('message', async (event, method, params) => {
          if (method === 'Network.requestWillBeSent') {
            const { requestId, request } = params;
            if (request.method === 'POST') {
              postRequestIdSet.add(requestId);
            }
          } else if (method === 'Network.responseReceived') {
            const { requestId, response } = params;
            // 检查是否是我们感兴趣的URL
            if (
              response.url.includes('/passport/web/user/login') &&
              response.status === 200 &&
              postRequestIdSet.has(requestId)
            ) {
              loginRequestIdSet.add(requestId);
            }
          } else if (method === 'Network.loadingFinished') {
            if (loginRequestIdSet.has(params.requestId)) {
              try {
                // 获取响应体
                const responseBody = await webContents.debugger.sendCommand(
                  'Network.getResponseBody',
                  { requestId: params.requestId },
                );
                const { body } = responseBody;
                if (typeof body === 'string' && body.startsWith('{')) {
                  const json = JSON.parse(body);
                  if (json.message === 'success') {
                    this._submitCookies();
                  }
                }
              } catch (err) {
                console.error('Failed to get response body:', err);
              }
            }
          }
        });
      } catch (err) {
        console.error('Failed to attach debugger:', err);
      }
    }
  }

  private async _addLoginView() {
    this._tkLoginPageView = new WebContentsView();
    const openTurnId = this._openTurnId;
    // 加载目标网页
    await this._tkLoginPageView.webContents.loadURL(TK_LOGIN_PAGE_URL);
    if (openTurnId !== this._openTurnId) {
      // 已过时
      return;
    }
    if (!this._tkLoginPageWindow) {
      return;
    }
    if (isDevelopment) {
      if (this._tkLoginPageView?.webContents) {
        this._tkLoginPageView.webContents.openDevTools({
          mode: 'right',
        });
      }
    }
    this._tkLoginPageWindow.contentView.addChildView(this._tkLoginPageView);
    this._watchLoginSuccess();
    bindViewToWindowBounds(this._tkLoginPageView, this._tkLoginPageWindow);
  }

  async open() {
    if (this._tkLoginPageWindow && !this._tkLoginPageWindow.isDestroyed()) {
      this.close();
    }
    try {
      this._tkLoginPageWindow = new BaseWindow({
        fullscreen: true,
      });
      this._openTurnId++;
      await this._addLoginView();
    } catch (error) {
      console.error('Error loading URL:', error);
    }
  }

  close() {
    if (this._tkLoginPageWindow) {
      this._tkLoginPageWindow.removeAllListeners('resize');
      this._tkLoginPageWindow.close();
      this._tkLoginPageWindow = null;
    }
    if (this._tkLoginPageView) {
      const webContents = this._tkLoginPageView.webContents;
      webContents.debugger.detach();
      webContents.close();
      this._tkLoginPageView = null;
    }
  }
}
