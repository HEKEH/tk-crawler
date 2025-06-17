import type {
  StartTKLiveAdminAccountRequest,
  StartTKLiveAdminAccountResponse,
  TKGuildUser,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import type { IView } from '../../types';
import path from 'node:path';
import process from 'node:process';
import {
  GUILD_COOKIE_PAGE_HELP_EVENTS,
  GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS,
  GUILD_COOKIE_PAGE_HELP_STATUS,
  GUILD_COOKIE_PAGE_HELP_WIDTH,
  TIKTOK_LIVE_ADMIN_URL,
} from '@tk-crawler/biz-shared';
import {
  catchRequestCookies,
  initProxy,
  loadUrlWithPreconnect,
} from '@tk-crawler/electron-utils/main';
import {
  MAC_USER_AGENT,
  RESPONSE_CODE,
  WINDOWS_USER_AGENT,
} from '@tk-crawler/shared';
import { BaseWindow, globalShortcut, screen, WebContentsView } from 'electron';
import { GuildCookiePageAutomationStateMachine } from './automation-state-machine';
import { GuildCookiePageIsLoggedIn } from './types';

export type StartTKGuildUserAccount = (
  params: Omit<StartTKLiveAdminAccountRequest, 'faction_id' | 'area'>,
) => Promise<StartTKLiveAdminAccountResponse>;

export function getGuildCookiePageViewKey(guildUser: TKGuildUser) {
  return `guild-cookie-page-view-${guildUser.id}`;
}

export class GuildCookiePageView implements IView {
  readonly key: string;

  private _window: BaseWindow | null = null;

  private _thirdPartyView: WebContentsView | null = null;

  private _helpView: WebContentsView | null = null;

  private _status: GUILD_COOKIE_PAGE_HELP_STATUS =
    GUILD_COOKIE_PAGE_HELP_STATUS.stateless;

  private _guildUser: TKGuildUser;

  private _openTurnId: number = 0;

  private _cookies: string | undefined;

  private _shortcutRegistered = false;

  private _isActivating = false;

  private _logger: Logger;

  private _isDevelopment: boolean;

  private _helpPageUrl: string;

  private _removeResizeListener: (() => void) | null = null;

  private _onClose: () => void;

  private _startTKGuildUserAccount: StartTKGuildUserAccount;

  private _isClosed = false;

  private _automationStateMachine: GuildCookiePageAutomationStateMachine | null =
    null;

  get isClosed() {
    return this._isClosed;
  }

  constructor(props: {
    guildUser: TKGuildUser;
    onClose: () => void;
    logger: Logger;
    isDevelopment: boolean;
    helpPageUrl: string;
    startTKGuildUserAccount: StartTKGuildUserAccount;
    iconPath?: string;
  }) {
    this._guildUser = props.guildUser;
    this.key = getGuildCookiePageViewKey(props.guildUser);
    this._onClose = props.onClose;
    this._logger = props.logger;
    this._isDevelopment = props.isDevelopment;
    this._helpPageUrl = props.helpPageUrl;
    this._startTKGuildUserAccount = props.startTKGuildUserAccount;
  }

  private _setStatus(status: GUILD_COOKIE_PAGE_HELP_STATUS) {
    this._status = status;
    this._onResize();
  }

  private _onResize() {
    if (!this._window || this._window?.isDestroyed()) {
      return;
    }
    const bounds = this._window.getBounds();
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
    if (this._isClosed) {
      return;
    }
    if (!this._helpView) {
      this._helpView = new WebContentsView({
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
        },
      });
      try {
        await this._helpView.webContents.loadURL(this._helpPageUrl);
      } catch (error) {
        this._logger.error('Failed to load URL:', error);
        this._helpView.webContents.close();
        throw error;
      }
      if (this._isClosed || !this._window) {
        return;
      }
      if (this._isDevelopment) {
        if (this._helpView?.webContents) {
          this._helpView.webContents.openDevTools({
            mode: 'bottom',
          });
        }
      }
      this._window.contentView.addChildView(this._helpView);
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
        this._logger.info(
          '[cookie-page-view] catchBatchCheckAnchorRequestCookies:',
          cookies,
        );
      },
    );
  }

  private _getRunningStatus() {
    if (this._isClosed) {
      return GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.stateless;
    }
    if (!this._thirdPartyView || !this._automationStateMachine) {
      return GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.stateless;
    }
    const isLoggedIn = this._automationStateMachine.isLoggedIn;
    if (isLoggedIn === GuildCookiePageIsLoggedIn.NOT_LOGGED_IN) {
      return GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.not_login;
    }
    if (isLoggedIn === GuildCookiePageIsLoggedIn.LOGGED_IN) {
      return GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.logged_in;
    }
    this._logger.info('[cookie-page-view] Unknown running status');
    return GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.unknown;
  }

  private async _openThirdPartyPageView(): Promise<void> {
    if (this._isClosed) {
      return;
    }
    this._openTurnId++;
    const currentOpenTurnId = this._openTurnId;
    if (!this._guildUser) {
      throw new Error('Guild user is not set');
    }
    this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.loading);
    try {
      // 加载目标网页
      const maxRetries = 3;
      let retryCount = 0;
      while (retryCount < maxRetries && !this._isClosed) {
        this._logger.info('Loading TIKTOK_LIVE_ADMIN_URL URL:', {
          retryCount,
        });
        try {
          this._thirdPartyView = new WebContentsView({
            webPreferences: {
              partition: `persist:tk-live-admin-user-${this._guildUser.username}`,
              // partition: `temp:tk-live-admin-user-${this._guildUser.username}`,
            },
          });
          this._thirdPartyView.webContents.setUserAgent(
            process.platform === 'win32' ? MAC_USER_AGENT : WINDOWS_USER_AGENT, // 神奇的现象，mac和windows使用自己本身的userAgent无法弹出验证码弹窗，使用对方的userAgent会弹窗
          );
          await loadUrlWithPreconnect(
            this._thirdPartyView,
            TIKTOK_LIVE_ADMIN_URL,
          );
          break;
        } catch (error) {
          this._logger.error(
            'Failed to load TIKTOK_LIVE_ADMIN_URL URL:',
            error,
            {
              retryCount,
            },
          );
          this._closeView(this._thirdPartyView!);
          retryCount++;
          if (retryCount >= maxRetries) {
            throw error;
          }
        }
      }
      // await sleep(2000);
      if (currentOpenTurnId !== this._openTurnId || this._isClosed) {
        // 已过时
        return;
      }
      if (this._isDevelopment) {
        if (this._thirdPartyView?.webContents) {
          this._thirdPartyView.webContents.openDevTools({
            mode: 'right',
          });
        }
      }
      this._window!.contentView.addChildView(this._thirdPartyView!);
      this._registerDevToolsShortcut();
      this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.opened);
      this._catchBatchCheckAnchorRequestCookies();
      this._activateAccount();
    } catch (error) {
      if ((error as any)?.code === 'ERR_CONNECTION_TIMED_OUT') {
        this._logger.error('Open cookie page timeout:', error);
        this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.timeout);
      } else {
        this._logger.error('Open cookie page error:', error);
        this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.fail);
      }
    }
  }

  private _closeView(view: WebContentsView) {
    if (!this._window) {
      return;
    }
    const webContents = view.webContents;
    if (webContents && !webContents.isDestroyed()) {
      webContents.debugger.detach();
      webContents.removeAllListeners();
      webContents.close();
      view.removeAllListeners();
      this._window.contentView.removeChildView(view);
    }
  }

  private _closeThirdPartyPageView() {
    this._destroyAutomationMachine();
    if (this._thirdPartyView) {
      this._closeView(this._thirdPartyView);
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

  private _helpPageEventNames: Array<string> = [];

  private _addHelpPageEventHandler(
    event: string,
    handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => void,
  ) {
    this._helpPageEventNames.push(event);
    this._helpView!.webContents.ipc.handle(event, handler);
  }

  private _addHelpPageEventHandlers() {
    this._addHelpPageEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.GET_STATUS,
      () => {
        return this._status;
      },
    );
    this._addHelpPageEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.GET_RUNNING_STATUS,
      () => {
        return this._getRunningStatus();
      },
    );
    this._addHelpPageEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.RETRY_OPEN_PAGE,
      async () => {
        await initProxy(this._logger);
        await this._reopenThirdPartyPageView();
      },
    );
    // this._addEventHandler(
    //   GUILD_COOKIE_PAGE_HELP_EVENTS.BACK_TO_MAIN_VIEW,
    //   async () => {
    //     await this._onClose();
    //   },
    // );
    this._addHelpPageEventHandler(
      GUILD_COOKIE_PAGE_HELP_EVENTS.FINISH,
      async () => {
        await this._finishActivate();
      },
    );
  }

  private _removeHelpPageEventHandlers() {
    if (!this._helpView) {
      return;
    }
    this._helpPageEventNames.forEach(event => {
      this._helpView!.webContents.ipc.removeHandler(event);
    });
    this._helpPageEventNames = [];
  }

  private async _activateAccount() {
    if (this._isClosed) {
      return;
    }
    // const webContents = this._thirdPartyView!.webContents;
    // if (webContents.isLoading()) {
    //   await new Promise(resolve => {
    //     webContents.on('did-finish-load', () => {
    //       resolve(true);
    //     });
    //   });
    // }
    if (this._isClosed) {
      return;
    }
    this._destroyAutomationMachine();
    this._automationStateMachine = new GuildCookiePageAutomationStateMachine({
      logger: this._logger,
      thirdPartyView: this._thirdPartyView!,
      username: this._guildUser!.username,
      password: this._guildUser!.password,
    });
    const result = await this._automationStateMachine.execute();
    if (result.success) {
      await this._finishActivate();
    } else {
      this._logger.error(
        '[cookie-page-view] activateAccount error:',
        result.error,
      );
    }
  }

  private async _getCookies(): Promise<string> {
    if (!this._thirdPartyView) {
      this._logger.error('[cookie-page-view] _getCookies: No third party view');
      return '';
    }
    if (this._cookies) {
      return this._cookies;
    } else {
      this._logger.warn('[cookie-page-view] _getCookies: No cookies catch');
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
    if (this._isActivating) {
      return;
    }
    this._isActivating = true;
    try {
      if (this._isClosed) {
        return;
      }
      const cookies = await this._getCookies();
      this._logger.info('[cookie-page-view] finishActivate cookies:', cookies);
      // if (!token) {
      //   this._logger.error(
      //     '[cookie-page-view] finishActivate: Token is not found',
      //   );
      //   return;
      // }
      await initProxy(this._logger); // 保险一点
      const response = await this._startTKGuildUserAccount({
        user_id: this._guildUser!.id,
        cookie: cookies,
      });
      if (response.status_code !== RESPONSE_CODE.SUCCESS) {
        this._logger.error(
          '[cookie-page-view] startTKGuildUserAccount business error:',
          response,
        );
        this._helpView?.webContents.send(
          GUILD_COOKIE_PAGE_HELP_EVENTS.REQUEST_ERROR,
          `保存失败: ${response.message}`,
        );
      } else {
        this.close();
      }
    } catch (error) {
      this._logger.error(
        '[cookie-page-view] startTKGuildUserAccount error:',
        error,
      );
      this._helpView?.webContents.send(
        GUILD_COOKIE_PAGE_HELP_EVENTS.REQUEST_ERROR,
        `保存失败，可能需要更换VPN节点: ${(error as any).message}`,
      );
    } finally {
      this._isActivating = false;
    }
  }

  setGuildUser(guildUser: TKGuildUser) {
    this._guildUser = guildUser;
  }

  private _getWindowPosition() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } =
      primaryDisplay.workAreaSize;

    // Get existing windows
    const existingWindows = BaseWindow.getAllWindows();

    const offset = 20;

    const width = 1200;
    const height = 800;

    // Calculate center position
    const centerX = Math.round((screenWidth - width) / 2); // 1200 is window width
    const centerY = Math.round((screenHeight - height) / 2); // 800 is window height

    // Calculate new position - start from center, cascade right
    const x = Math.min(
      centerX + existingWindows.length * offset,
      screenWidth - width,
    );
    const y = Math.max(centerY - existingWindows.length * offset, 0);
    return { width, height, x, y };
  }

  async show() {
    try {
      if (this._window) {
        this.focus();
        return;
      }
      // Create window with position
      this._window = new BaseWindow({
        title: `账号激活 - ${this._guildUser.username}`,
        autoHideMenuBar: true,
        show: false,
        ...this._getWindowPosition(),
      });
      this._window.on('close', () => {
        this.close();
      });
      const onResize = () => {
        this._onResize();
      };
      this._window.on('resize', onResize);
      this._removeResizeListener = () => {
        this._window?.removeListener('resize', onResize);
        this._removeResizeListener = null;
      };
      this._window.showInactive();
      await this._openHelpView();
      this._addHelpPageEventHandlers();
      await this._openThirdPartyPageView();
      // const result = await this._openThirdPartyPageView();
      // if (result === 'failed') {
      //   // 如果失败了，重试一次
      //   await this._reopenThirdPartyPageView();
      // }
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

  private _destroyAutomationMachine() {
    if (this._automationStateMachine) {
      this._automationStateMachine.destroy();
      this._automationStateMachine = null;
    }
  }

  focus() {
    this._window?.focus();
  }

  close() {
    if (this._isClosed || !this._window) {
      return;
    }
    this._destroyAutomationMachine();
    this._unregisterDevToolsShortcut();
    this._removeResizeListener?.();
    this._removeHelpPageEventHandlers();
    this._closeThirdPartyPageView();
    this._closeHelpView();
    this._setStatus(GUILD_COOKIE_PAGE_HELP_STATUS.stateless);
    this._window.removeAllListeners();
    this._window.destroy();
    this._window = null;
    this._isClosed = true;
    this._onClose();
  }

  destroy() {
    this.close();
  }
}
