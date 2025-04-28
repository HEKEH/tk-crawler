import type { TKGuildUser } from '@tk-crawler/biz-shared';
import type { BaseWindow } from 'electron';
import type { IView } from './types';
import path from 'node:path';
import { TIKTOK_LIVE_ADMIN_URL } from '@tk-crawler/biz-shared';
import {
  catchRequestCookies,
  findElement,
  initProxy,
  InputEventFunctionStr,
} from '@tk-crawler/electron-utils/main';
import {
  GUILD_COOKIE_PAGE_HELP_EVENTS,
  GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS,
  GUILD_COOKIE_PAGE_HELP_STATUS,
  GUILD_COOKIE_PAGE_HELP_WIDTH,
} from '@tk-crawler/main-client-shared';
import { RESPONSE_CODE, sleep } from '@tk-crawler/shared';
import { globalShortcut, ipcMain, WebContentsView } from 'electron';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { logger } from '../../infra/logger';
import { startTKGuildUserAccount } from '../../requests/tk-guild-user';
import { getToken } from '../services/token';

const DEMO_ANCHOR = 'arxigosvstiktok';

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

  private _cookies: string | undefined;

  private _shortcutRegistered = false;

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

  private _catchBatchCheckAnchorRequestCookies() {
    if (!this._thirdPartyView) {
      return;
    }
    catchRequestCookies(
      `${TIKTOK_LIVE_ADMIN_URL}/creators/live/union_platform_api/agency/union_invite/batch_check_anchor*`,
      this._thirdPartyView,
      (cookies: string) => {
        this._cookies = cookies;
        logger.info(
          '[cookie-page-view] catchBatchCheckAnchorRequestCookies:',
          cookies,
        );
      },
    );
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
    logger.info('[cookie-page-view] Unknown running status');
  }

  private _loadThirdPartyURL(view: WebContentsView, url: string) {
    return view.webContents.loadURL(url);
  }

  private async _openThirdPartyPageView(): Promise<'failed' | undefined> {
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
      this._registerDevToolsShortcut();
      this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.opened);
      this._catchBatchCheckAnchorRequestCookies();
      await this._refreshRunningStatus();
      let tryRemainCount = 40;
      while (
        this._runningStatus === GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.unknown &&
        tryRemainCount > 0
      ) {
        await sleep(100);
        await this._refreshRunningStatus();
        tryRemainCount--;
      }

      if (
        this._runningStatus === GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.not_login
      ) {
        await this._tryLogin();
      } else if (
        this._runningStatus === GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.logged_in
      ) {
        await this._handleLoginSuccess();
      }
    } catch (error) {
      if ((error as any)?.code === 'ERR_CONNECTION_TIMED_OUT') {
        logger.error('Open cookie page timeout:', error);
        this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.timeout);
      } else {
        logger.error('Open cookie page error:', error);
        this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.fail);
      }
      return 'failed';
    }
  }

  private _closeView(view: WebContentsView) {
    const webContents = view.webContents;
    webContents.debugger.detach();
    webContents.removeAllListeners();
    webContents.close();
    view.removeAllListeners();
    this._parentWindow.contentView.removeChildView(view);
  }

  private _closeThirdPartyPageView() {
    if (this._thirdPartyView) {
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
        await initProxy(logger);
        await this._reopenThirdPartyPageView();
      },
    );
    this._addEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.BACK_TO_MAIN_VIEW,
      async () => {
        await this._backToMainView();
      },
    );
    this._addEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.CHECK_IF_LOGIN_SUCCESS,
      async () => {
        const isLoginSuccess = await this._checkIfLoginSuccess();
        if (isLoginSuccess) {
          this._handleLoginSuccess();
        }
      },
    );
    this._addEventHandler(GUILD_COOKIE_PAGE_HELP_EVENTS.FINISH, async () => {
      await this._finishActivate();
    });
  }

  private _removeEventHandlers() {
    this._eventNames.forEach(event => {
      ipcMain.removeHandler(event);
    });
    this._eventNames = [];
  }

  private get isClosed() {
    return this._thirdPartyView === null;
  }

  private async _tryLogin() {
    const webContents = this._thirdPartyView!.webContents;
    if (webContents.isLoading()) {
      await new Promise(resolve => {
        webContents.on('did-finish-load', () => {
          resolve(true);
        });
      });
    }
    const { username, password } = this._guildUser!;
    const operationResult = await webContents.executeJavaScript(`
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
          const passwordIcon = passwordInput.nextElementSibling?.querySelector('.semi-icon');
          if (passwordIcon) {
            passwordIcon.click();
          }

          await sleep(500);

          const loginSubmitButton = document.querySelector('button[data-id="login-primary-button"]');
          if (!loginSubmitButton) {
            return { success: false, error: 'login submit button not found' };
          }
          loginSubmitButton.click();

          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })();
    `);
    logger.info('[cookie-page-view] tryLogin:', operationResult);
    if (!operationResult.success) {
      return;
    }
    let isLoginSuccess = false;
    let tryCount = 0;
    await sleep(1000);
    while (
      !isLoginSuccess &&
      tryCount < 20 &&
      this._guildUser &&
      !this.isClosed
    ) {
      isLoginSuccess = await this._checkIfLoginSuccess();
      tryCount++;
      if (!isLoginSuccess) {
        await sleep(1000);
      }
    }
    if (isLoginSuccess) {
      this._handleLoginSuccess();
    }
  }

  private async _checkIfLoginSuccess() {
    await this._refreshRunningStatus();
    if (this.isClosed) {
      return false;
    }
    const isLoginSuccess =
      this._runningStatus === GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.logged_in;
    return isLoginSuccess;
  }

  private async _handleLoginSuccess() {
    const webContents = this._thirdPartyView!.webContents;
    const operationResult = await webContents.executeJavaScript(`
      (async function() {
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        ${InputEventFunctionStr}
        try {
          const navigationList = document.querySelector('.semi-navigation-vertical .semi-navigation-list');
          if (!navigationList) {
            return { success: false, error: 'navigationList not found' };
          }
          const workspaceButton = navigationList.childNodes[0];
          if (!workspaceButton) {
            return { success: false, error: 'workspaceButton not found' };
          }
          workspaceButton.click();
          await sleep(1000);
          const scoutCreatorsTabBar = document.querySelector('.semi-tabs[data-id="TodoTaskStageCard2"] #semiTab1');
          if (!scoutCreatorsTabBar) {
            return { success: false, error: 'scoutCreatorsTabBar not found' };
          }
          scoutCreatorsTabBar.click();
          await sleep(500);
          const inviteCreatorsButton = document.querySelector('button[data-id="agent-workplace-add-host"]');
          if (!inviteCreatorsButton) {
            return { success: false, error: 'inviteCreatorsButton not found' };
          }
          inviteCreatorsButton.click();
          await sleep(1000);
          const inviteHostTextArea = document.querySelector('textarea[data-testid="inviteHostTextArea"]');
          if (!inviteHostTextArea) {
            return { success: false, error: 'inviteHostTextArea not found' };
          }
          inputEvent(inviteHostTextArea, '${DEMO_ANCHOR}');
          await sleep(200);
          const nextButton = document.querySelector('button[data-id="invite-host-next"]');
          if (!nextButton) {
            return { success: false, error: 'nextButton not found' };
          }
          nextButton.click();
          await sleep(500);

          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })();
    `);
    logger.info('[cookie-page-view] handleLoginSuccess:', operationResult);
    if (!operationResult.success) {
      return;
    }
    let isActivateSuccess = false;
    let tryCount = 0;
    await sleep(1000);
    while (!isActivateSuccess && tryCount < 40 && !this.isClosed) {
      isActivateSuccess = await this._checkIfFinishActivate();
      tryCount++;
      if (!isActivateSuccess) {
        await sleep(1000);
      }
    }
    // await sleep(2000);
    if (isActivateSuccess) {
      this._finishActivate();
    }
  }

  private async _checkIfFinishActivate() {
    const { success } = await findElement(
      this._thirdPartyView!,
      'div[data-id="host-info"] div[data-id="host-table"]',
    );
    return success;
  }

  private async _getCookies(): Promise<string> {
    if (!this._thirdPartyView) {
      logger.error('[cookie-page-view] _getCookies: No third party view');
      return '';
    }
    if (this._cookies) {
      return this._cookies;
    } else {
      logger.warn('[cookie-page-view] _getCookies: No cookies catch');
    }
    const session = this._thirdPartyView.webContents.session;
    try {
      const cookies = await session.cookies.get({});
      return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    } catch (error) {
      console.error('Failed to get cookies:', error);
      throw error;
    }
  }

  private async _finishActivate() {
    const cookies = await this._getCookies();
    logger.info('[cookie-page-view] finishActivate cookies:', cookies);
    const token = getToken();
    if (!token) {
      logger.error('[cookie-page-view] finishActivate: Token is not found');
      return;
    }
    try {
      await initProxy(logger); // 保险一点
      const response = await startTKGuildUserAccount(
        {
          user_id: this._guildUser!.id,
          cookie: cookies,
        },
        token,
      );
      if (response.status_code !== RESPONSE_CODE.SUCCESS) {
        logger.error(
          '[cookie-page-view] startTKGuildUserAccount business error:',
          response,
        );
        this._helpView?.webContents.send(
          GUILD_COOKIE_PAGE_HELP_EVENTS.REQUEST_ERROR,
          `保存失败: ${response.message}`,
        );
      } else {
        this._backToMainView();
      }
    } catch (error) {
      logger.error('[cookie-page-view] startTKGuildUserAccount error:', error);
      this._helpView?.webContents.send(
        GUILD_COOKIE_PAGE_HELP_EVENTS.REQUEST_ERROR,
        `保存失败: ${(error as any).message}`,
      );
    }
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
      const result = await this._openThirdPartyPageView();
      if (result === 'failed') {
        // 如果失败了，重试一次
        await this._reopenThirdPartyPageView();
      }
    } catch (error) {
      console.error('Error loading URL:', error);
    }
  }

  private _registerDevToolsShortcut() {
    if (this._shortcutRegistered) {
      return;
    }

    globalShortcut.register('F12', () => {
      if (this._thirdPartyView?.webContents) {
        this._thirdPartyView.webContents.toggleDevTools();
      }
    });

    this._shortcutRegistered = true;
  }

  private _unregisterDevToolsShortcut() {
    if (this._shortcutRegistered) {
      globalShortcut.unregister('F12');
      this._shortcutRegistered = false;
    }
  }

  close() {
    this._unregisterDevToolsShortcut();
    this._removeResizeListener?.();
    this._removeEventHandlers();
    this._closeThirdPartyPageView();
    this._closeHelpView();
    this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.stateless);
    this._guildUser = undefined;
  }

  destroy() {
    this.close();
  }
}
