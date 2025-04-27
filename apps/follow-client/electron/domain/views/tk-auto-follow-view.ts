import type { BaseWindow } from 'electron';
import path from 'node:path';
import {
  clickElement,
  initProxy,
  loadThirdPartyURL,
} from '@tk-crawler/electron-utils/main';
import { ipcMain, WebContentsView } from 'electron';
import {
  AUTO_FOLLOWED_RESULT_TYPE,
  TIKTOK_AUTO_FOLLOW_HELP_WIDTH,
  TIKTOK_AUTO_FOLLOW_PAGE_EVENTS,
  TIKTOK_AUTO_FOLLOW_PAGE_STATUS,
  TIKTOK_AUTO_FOLLOW_RUNNING_STATUS,
  TK_URL,
} from '../../constants';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { logger } from '../../infra/logger';

enum FOLLOW_PAGE_STATUS {
  NOT_FOLLOWED = 'not_followed',
  ALREADY_FOLLOWED = 'already_followed',
  NOT_FOUND = 'not_found',
  ERROR = 'error',
}

export class TKAutoFollowView {
  private _parentWindow: BaseWindow;

  private _tkPageView: WebContentsView | null = null;

  private _helpView: WebContentsView | null = null;

  private _status: TIKTOK_AUTO_FOLLOW_PAGE_STATUS =
    TIKTOK_AUTO_FOLLOW_PAGE_STATUS.stateless;

  private _userIds: string[] = [];

  private _currentUserIndex: number = 0;

  private _runningStatus: TIKTOK_AUTO_FOLLOW_RUNNING_STATUS =
    TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.not_started;

  private _openTurnId: number = 0;

  private _removeResizeListener: (() => void) | null = null;

  private _goBack: () => void;

  constructor(props: { parentWindow: BaseWindow; goBack: () => void }) {
    this._parentWindow = props.parentWindow;
    this._goBack = props.goBack;
  }

  updateUserIds(userIds: string[]) {
    this._userIds = userIds;
    this._currentUserIndex = 0;
  }

  private _setStatus(status: TIKTOK_AUTO_FOLLOW_PAGE_STATUS) {
    this._status = status;
    this._onResize();
  }

  private _onResize() {
    if (!this._parentWindow) {
      return;
    }
    const bounds = this._parentWindow.getBounds();
    if (this._status === TIKTOK_AUTO_FOLLOW_PAGE_STATUS.opened) {
      const sidebarWidth = Math.min(
        TIKTOK_AUTO_FOLLOW_HELP_WIDTH,
        bounds.width,
      );
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
          `${VITE_DEV_SERVER_URL}tiktok-auto-follow-help.html`,
        );
      } else {
        await this._helpView.webContents.loadFile(
          path.join(RENDERER_DIST, 'tiktok-auto-follow-help.html'),
        );
      }
      this._parentWindow!.contentView.addChildView(this._helpView);
      this._onResize();
    }
  }

  private _loadThirdPartyURL(view: WebContentsView, url: string) {
    return loadThirdPartyURL(view, url, error => {
      logger.error('Load third party url error:', error);
    });
  }

  private async _openTKPageView() {
    this._openTurnId++;
    const currentOpenTurnId = this._openTurnId;
    this._tkPageView = new WebContentsView();
    this._setStatus(TIKTOK_AUTO_FOLLOW_PAGE_STATUS.loading);
    try {
      this._tkPageView.webContents.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      );
      // 加载目标网页
      await this._loadThirdPartyURL(this._tkPageView, TK_URL);

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
      this._setStatus(TIKTOK_AUTO_FOLLOW_PAGE_STATUS.opened);
    } catch (error) {
      if ((error as any)?.code === 'ERR_CONNECTION_TIMED_OUT') {
        logger.error('Open tiktok login page timeout:', error);
        this._setStatus(TIKTOK_AUTO_FOLLOW_PAGE_STATUS.timeout);
      } else {
        logger.error('Open tiktok login page error:', error);
        this._setStatus(TIKTOK_AUTO_FOLLOW_PAGE_STATUS.fail);
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
    this._addEventHandler(TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.GET_STATUS, () => {
      return this._status;
    });
    this._addEventHandler(
      TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.RETRY_OPEN_PAGE,
      async () => {
        await initProxy(logger);
        await this._reopenTKPageView();
      },
    );
    this._addEventHandler(
      TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.GET_RUNNING_STATUS,
      () => {
        return this._runningStatus;
      },
    );
    this._addEventHandler(
      TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.START_AUTO_FOLLOW,
      () => {
        this._startAutoFollow();
      },
    );
    this._addEventHandler(
      TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.PAUSE_AUTO_FOLLOW,
      () => {
        this._pauseAutoFollow();
      },
    );
    this._addEventHandler(
      TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.CONTINUE_AUTO_FOLLOW,
      () => {
        this._continueAutoFollow();
      },
    );
    this._addEventHandler(TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.CLOSE_AND_BACK, () => {
      this._stopAutoFollow();
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
        this._removeResizeListener = null;
      };
      await this._openHelpView();
      await this._openTKPageView();
    } catch (error) {
      console.error('Error loading URL:', error);
    }
  }

  private async _checkFollowPage(): Promise<FOLLOW_PAGE_STATUS> {
    const selector = 'button[data-e2e="follow-button"]';
    const result = await this._tkPageView!.webContents.executeJavaScript(`
      (function() {
        try {
          const element = document.querySelector('${selector}');
          if (element) {
            if (element.classList.contains('TUXButton--primary')) {
              return '${FOLLOW_PAGE_STATUS.NOT_FOLLOWED}';
            }
            return '${FOLLOW_PAGE_STATUS.ALREADY_FOLLOWED}';
          }
          return '${FOLLOW_PAGE_STATUS.NOT_FOUND}';
        } catch (error) {
          return '${FOLLOW_PAGE_STATUS.ERROR}';
        }
      })()
    `);
    return result as FOLLOW_PAGE_STATUS;
  }

  private async _clickFollowButton() {
    const clickResult = await clickElement(
      this._tkPageView!,
      'button[data-e2e="follow-button"]',
    );
    logger.info('[Click follow button]', clickResult);
    return clickResult;
  }

  private async _runAutoFollow() {
    if (this._tkPageView && this._userIds[this._currentUserIndex]) {
      const userId = this._userIds[this._currentUserIndex];
      try {
        await this._loadThirdPartyURL(this._tkPageView, `${TK_URL}/@${userId}`);
        await sleep(1000);
        if (
          this._runningStatus !== TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.running ||
          !this._tkPageView
        ) {
          return;
        }
        const followPageStatus = await this._checkFollowPage();
        let followResultType: AUTO_FOLLOWED_RESULT_TYPE;
        switch (followPageStatus) {
          case FOLLOW_PAGE_STATUS.NOT_FOLLOWED: {
            const clickResult = await this._clickFollowButton();
            if (clickResult.success) {
              followResultType = AUTO_FOLLOWED_RESULT_TYPE.SUCCESS;
            } else {
              followResultType = AUTO_FOLLOWED_RESULT_TYPE.FAIL;
            }
            break;
          }
          case FOLLOW_PAGE_STATUS.ALREADY_FOLLOWED: {
            followResultType = AUTO_FOLLOWED_RESULT_TYPE.ALREADY_FOLLOWED;
            break;
          }
          case FOLLOW_PAGE_STATUS.NOT_FOUND: {
            followResultType = AUTO_FOLLOWED_RESULT_TYPE.NOT_FOUND;
            break;
          }
          case FOLLOW_PAGE_STATUS.ERROR: {
            followResultType = AUTO_FOLLOWED_RESULT_TYPE.FAIL;
            break;
          }
        }
        this._helpView?.webContents.send(
          TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.AUTO_FOLLOWED_RESULT,
          { user_id: userId, type: followResultType },
        );
        this._currentUserIndex++;
      } catch (error) {
        logger.error('Run auto follow error:', error);
        this._helpView?.webContents.send(
          TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.AUTO_FOLLOWED_RESULT,
          { user_id: userId, type: AUTO_FOLLOWED_RESULT_TYPE.FAIL },
        );
        this._currentUserIndex++;
      }
    }
  }

  private async _startAutoFollow() {
    this._runningStatus = TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.running;
    while (
      this._currentUserIndex < this._userIds.length &&
      this._runningStatus === TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.running &&
      this._tkPageView
    ) {
      await this._runAutoFollow();
      await sleep(1000);
    }
    if (
      this._userIds.length &&
      this._currentUserIndex === this._userIds.length &&
      this._runningStatus === TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.running
    ) {
      this._runningStatus = TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.completed;
    }
  }

  private _pauseAutoFollow() {
    this._runningStatus = TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.paused;
  }

  private _continueAutoFollow() {
    this._startAutoFollow();
  }

  private _stopAutoFollow() {
    this.close();
    this._goBack();
  }

  close() {
    this._removeResizeListener?.();
    this._removeEventHandlers();
    this._closeTKPageView();
    this._closeHelpView();
    this._userIds = [];
    this._currentUserIndex = 0;
    this._runningStatus = TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.not_started;
    this._setStatus(TIKTOK_AUTO_FOLLOW_PAGE_STATUS.stateless);
  }

  destroy() {
    this.close();
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
