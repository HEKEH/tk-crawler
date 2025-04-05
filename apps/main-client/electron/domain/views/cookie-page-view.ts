import type { TKGuildUser } from '@tk-crawler/biz-shared';
import type { BaseWindow } from 'electron';
import type { IView } from './types';
import path from 'node:path';
import { TIKTOK_LIVE_ADMIN_URL } from '@tk-crawler/biz-shared';
import {
  findElement,
  InputEventFunctionStr,
  loadThirdPartyURL,
} from '@tk-crawler/electron-utils/main';
import {
  GUILD_COOKIE_PAGE_HELP_EVENTS,
  GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS,
  GUILD_COOKIE_PAGE_HELP_STATUS,
  GUILD_COOKIE_PAGE_HELP_WIDTH,
} from '@tk-crawler/main-client-shared';
import { sleep } from '@tk-crawler/shared';
import { ipcMain, WebContentsView } from 'electron';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { logger } from '../../infra/logger';

export class CookiePageView implements IView {
  private _parentWindow: BaseWindow;

  private _thirdPartyView: WebContentsView | null = null;

  private _helpView: WebContentsView | null = null;

  private _status: GUILD_COOKIE_PAGE_HELP_STATUS =
    GUILD_COOKIE_PAGE_HELP_STATUS.stateless;

  private _runningStatus: GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS =
    GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.stateless;

  private _guildUser: TKGuildUser | undefined;

  private _openTurnId: number = 0;

  private _removeResizeListener: (() => void) | null = null;

  private _backToMainView: () => void;

  constructor(props: { parentWindow: BaseWindow; backToMainView: () => void }) {
    this._parentWindow = props.parentWindow;
    this._backToMainView = props.backToMainView;
  }

  private _setStatus(status: GUILD_COOKIE_PAGE_HELP_STATUS) {
    this._status = status;
    this._onResize();
  }

  private _onResize() {
    if (this._parentWindow.isDestroyed()) {
      return;
    }
    const bounds = this._parentWindow.getBounds();
    if (this._status === GUILD_COOKIE_PAGE_HELP_STATUS.opened) {
      const sidebarWidth = Math.min(GUILD_COOKIE_PAGE_HELP_WIDTH, bounds.width);
      this._helpView?.setBounds({
        x: 0,
        y: 0,
        width: sidebarWidth,
        height: bounds.height,
      });
      this._thirdPartyView?.setBounds({
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
      this._thirdPartyView?.setBounds(viewBounds);
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
          `${VITE_DEV_SERVER_URL}guild-cookie-page-help.html`,
        );
      } else {
        await this._helpView.webContents.loadFile(
          path.join(RENDERER_DIST, 'guild-cookie-page-help.html'),
        );
      }
      if (isDevelopment) {
        if (this._helpView?.webContents) {
          this._helpView.webContents.openDevTools({
            mode: 'bottom',
          });
        }
      }
      this._parentWindow.contentView.addChildView(this._helpView);
      this._onResize();
    }
  }

  private async _refreshRunningStatus() {
    if (!this._thirdPartyView) {
      this._runningStatus = GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.stateless;
      return;
    }
    const loginButton = await findElement(
      this._thirdPartyView,
      'button[data-id="login"]',
    );
    if (loginButton.success) {
      this._runningStatus = GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.not_login;
      return;
    }
    const avatarElem = await findElement(
      this._thirdPartyView,
      '.semi-avatar-circle',
    );
    if (avatarElem.success) {
      this._runningStatus = GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.logged_in;
      return;
    }
    this._runningStatus = GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.unknown;
    logger.error('Unknown running status');
  }

  private _loadThirdPartyURL(view: WebContentsView, url: string) {
    return loadThirdPartyURL(view, url, error => {
      logger.error('Load third party url error:', error);
    });
  }

  private async _openThirdPartyPageView() {
    this._openTurnId++;
    const currentOpenTurnId = this._openTurnId;
    if (!this._guildUser) {
      throw new Error('Guild user is not set');
    }
    this._thirdPartyView = new WebContentsView({
      webPreferences: {
        partition: `persist:tk-live-admin-user-${this._guildUser.username}`,
      },
    });
    this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.loading);
    try {
      this._thirdPartyView.webContents.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      );
      // 加载目标网页
      await this._loadThirdPartyURL(
        this._thirdPartyView,
        TIKTOK_LIVE_ADMIN_URL,
      );
      await sleep(2000);
      if (currentOpenTurnId !== this._openTurnId) {
        // 已过时
        return;
      }
      if (isDevelopment) {
        if (this._thirdPartyView?.webContents) {
          this._thirdPartyView.webContents.openDevTools({
            mode: 'right',
          });
        }
      }
      this._parentWindow.contentView.addChildView(this._thirdPartyView);
      this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.opened);
      await this._refreshRunningStatus();
      await this._inputLoginInfo();
    } catch (error) {
      if ((error as any)?.code === 'ERR_CONNECTION_TIMED_OUT') {
        logger.error('Open cookie page timeout:', error);
        this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.timeout);
      } else {
        logger.error('Open cookie page error:', error);
        this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.fail);
      }
    }
  }

  private _closeView(view: WebContentsView) {
    const webContents = view.webContents;
    webContents.close();
    this._parentWindow.contentView.removeChildView(view);
  }

  private _closeThirdPartyPageView() {
    if (this._thirdPartyView) {
      this._thirdPartyView.webContents.debugger.detach();
      this._closeView(this._thirdPartyView);
      this._runningStatus = GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.stateless;
      this._thirdPartyView = null;
    }
  }

  private _closeHelpView() {
    if (this._helpView) {
      this._closeView(this._helpView);
      this._helpView = null;
    }
  }

  private async _reopenThirdPartyPageView() {
    this._closeThirdPartyPageView();
    await this._openThirdPartyPageView();
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
    this._addEventHandler(GUILD_COOKIE_PAGE_HELP_EVENTS.GET_STATUS, () => {
      return this._status;
    });
    this._addEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.REFRESH_RUNNING_STATUS,
      async () => {
        await this._refreshRunningStatus();
      },
    );
    this._addEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.GET_RUNNING_STATUS,
      () => {
        return this._runningStatus;
      },
    );
    this._addEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.RETRY_OPEN_PAGE,
      async () => {
        await this._reopenThirdPartyPageView();
      },
    );
    this._addEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.BACK_TO_MAIN_VIEW,
      async () => {
        await this._backToMainView();
      },
    );
  }

  private _removeEventHandlers() {
    this._eventNames.forEach(event => {
      ipcMain.removeHandler(event);
    });
    this._eventNames = [];
  }

  private async _inputLoginInfo() {
    const webContents = this._thirdPartyView!.webContents;
    if (webContents.isLoading()) {
      await new Promise(resolve => {
        webContents.on('did-finish-load', () => {
          resolve(true);
        });
      });
    }
    const { username, password } = this._guildUser!;
    const result = await webContents.executeJavaScript(`
      (async function() {
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        ${InputEventFunctionStr}
        try {
          const loginButton = document.querySelector('button[data-id="login"]');
          if (!loginButton) {
            return { success: false, error: 'login button not found' };
          }
          loginButton.click();
          await sleep(500);
          const loginForm = document.querySelector('form[data-id="login-form-login-email"]');
          if (!loginForm) {
            return { success: false, error: 'login form not found' };
          }
          const emailInput = loginForm.querySelector('#email');
          if (!emailInput) {
            return { success: false, error: 'email input not found' };
          }
          inputEvent(emailInput, '${username}');
          const passwordInput = loginForm.querySelector('#password');
          if (!passwordInput) {
            return { success: false, error: 'password input not found' };
          }
          inputEvent(passwordInput, '${password}');

          await sleep(500);

          const loginSubmitButton = document.querySelector('button[data-id="login-primary-button"]');
          if (!loginSubmitButton) {
            return { success: false, error: 'login submit button not found' };
          }
          loginSubmitButton.click();
          await sleep(1000);

          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })();
    `);
    logger.info('[cookie-page-view] inputLoginInfo:', result);
  }

  setGuildUser(guildUser: TKGuildUser) {
    this._guildUser = guildUser;
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
        this._removeResizeListener = null;
      };
      await this._openHelpView();
      await this._openThirdPartyPageView();
    } catch (error) {
      console.error('Error loading URL:', error);
    }
  }

  close() {
    this._removeResizeListener?.();
    this._removeEventHandlers();
    this._closeThirdPartyPageView();
    this._closeHelpView();
    this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.stateless);
  }

  destroy() {
    this.close();
  }
}
