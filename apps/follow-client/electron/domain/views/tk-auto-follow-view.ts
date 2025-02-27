import type { BaseWindow } from 'electron';
import path from 'node:path';
import { clickElement, loadThirdPartyURL } from '@tk-crawler/electron-utils';
import { ipcMain, WebContentsView } from 'electron';
import {
  TIKTOK_AUTO_FOLLOW_HELP_WIDTH,
  TIKTOK_AUTO_FOLLOW_PAGE_EVENTS,
  TIKTOK_AUTO_FOLLOW_PAGE_STATUS,
} from '../../constants';
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { logger } from '../../infra/logger';

const TK_LOGIN_PAGE_URL = 'https://www.tiktok.com/login';

export interface TKAutoFollowViewContext {}

export class TKAutoFollowView {
  private _context: TKAutoFollowViewContext;

  private _parentWindow: BaseWindow;

  private _tkPageView: WebContentsView | null = null;

  private _helpView: WebContentsView | null = null;

  private _status: TIKTOK_AUTO_FOLLOW_PAGE_STATUS =
    TIKTOK_AUTO_FOLLOW_PAGE_STATUS.stateless;

  private _openTurnId: number = 0;

  private _removeResizeListener: (() => void) | null = null;

  constructor(props: {
    parentWindow: BaseWindow;
    context: TKAutoFollowViewContext;
  }) {
    this._parentWindow = props.parentWindow;
    this._context = props.context;
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
      this._helpView?.setBounds({
        x: 0,
        y: 0,
        width: TIKTOK_AUTO_FOLLOW_HELP_WIDTH,
        height: bounds.height,
      });
      this._tkPageView?.setBounds({
        x: TIKTOK_AUTO_FOLLOW_HELP_WIDTH,
        y: 0,
        width: bounds.width - TIKTOK_AUTO_FOLLOW_HELP_WIDTH,
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
      // 加载目标网页
      await this._loadThirdPartyURL(this._tkPageView, TK_LOGIN_PAGE_URL);

      setTimeout(async () => {
        const res = await clickElement(
          this._tkPageView!,
          'span[data-e2e="bottom-sign-up"]',
        );
        console.log('click element result:', res);
      }, 1000);

      if (currentOpenTurnId !== this._openTurnId) {
        // 已过时
        return;
      }
      // if (isDevelopment) {
      //   if (this._tkPageView?.webContents) {
      //     this._tkPageView.webContents.openDevTools({
      //       mode: 'right',
      //     });
      //   }
      // }
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
        await this._reopenTKPageView();
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
      this._parentWindow.on('resize', onResize);
      this._removeResizeListener = onResize;
      await this._openHelpView();
      await this._openTKPageView();
    } catch (error) {
      console.error('Error loading URL:', error);
    }
  }

  close() {
    this._removeResizeListener?.();
    this._removeResizeListener = null;
    this._removeEventHandlers();
    this._closeTKPageView();
    this._closeHelpView();
    this._setStatus(TIKTOK_AUTO_FOLLOW_PAGE_STATUS.stateless);
  }

  destroy() {
    this.close();
  }
}
