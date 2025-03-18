import type { AnchorFrom87RawData } from '@tk-crawler/biz-shared';
import type { BaseWindow } from 'electron';
import type { IView } from './types';
import path from 'node:path';
import { findElement } from '@tk-crawler/electron-utils/main';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import {
  COLLECT_PAGE_HELP_EVENTS,
  COLLECT_PAGE_HELP_RUNNING_STATUS,
  COLLECT_PAGE_HELP_STATUS,
  COLLECT_PAGE_HELP_WIDTH,
  MOCK_ORG_ID,
} from '@tk-mobile-follow-client/shared';
import { ipcMain, WebContentsView } from 'electron';
import { isDevelopment, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../../env';
import { logger } from '../../infra/logger';
import { createOrUpdateAnchorFrom87 } from '../../requests';

const TK_87_URL = 'http://tk.87cloud.cn/';

export class CollectPageView implements IView {
  private _parentWindow: BaseWindow;

  private _thirdPartyView: WebContentsView | null = null;

  private _helpView: WebContentsView | null = null;

  private _status: COLLECT_PAGE_HELP_STATUS =
    COLLECT_PAGE_HELP_STATUS.stateless;

  private _runningStatus: COLLECT_PAGE_HELP_RUNNING_STATUS =
    COLLECT_PAGE_HELP_RUNNING_STATUS.stateless;

  private _openTurnId: number = 0;

  private _removeResizeListener: (() => void) | null = null;

  private _backToMainView: () => void;

  constructor(props: { parentWindow: BaseWindow; backToMainView: () => void }) {
    this._parentWindow = props.parentWindow;
    this._backToMainView = props.backToMainView;
  }

  private _setStatus(status: COLLECT_PAGE_HELP_STATUS) {
    this._status = status;
    this._onResize();
  }

  private _onResize() {
    const bounds = this._parentWindow.getBounds();
    if (this._status === COLLECT_PAGE_HELP_STATUS.opened) {
      const sidebarWidth = Math.min(COLLECT_PAGE_HELP_WIDTH, bounds.width);
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
          `${VITE_DEV_SERVER_URL}collect-page-help.html`,
        );
      } else {
        await this._helpView.webContents.loadFile(
          path.join(RENDERER_DIST, 'collect-page-help.html'),
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
      this._runningStatus = COLLECT_PAGE_HELP_RUNNING_STATUS.stateless;
      return;
    }
    const element = await findElement(this._thirdPartyView, '.user-menu');
    if (element.success) {
      this._runningStatus = COLLECT_PAGE_HELP_RUNNING_STATUS.running;
    } else {
      this._runningStatus = COLLECT_PAGE_HELP_RUNNING_STATUS.not_login;
    }
  }

  private async _openThirdPartyPageView() {
    this._openTurnId++;
    const currentOpenTurnId = this._openTurnId;
    this._thirdPartyView = new WebContentsView();
    this._setStatus(COLLECT_PAGE_HELP_STATUS.loading);
    try {
      this._thirdPartyView.webContents.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      );
      // 加载目标网页
      await this._thirdPartyView.webContents.loadURL(TK_87_URL);
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
      this._setStatus(COLLECT_PAGE_HELP_STATUS.opened);
      this._watchAnchorListFetch();
      await this._refreshRunningStatus();
    } catch (error) {
      if ((error as any)?.code === 'ERR_CONNECTION_TIMED_OUT') {
        logger.error('Open collect page timeout:', error);
        this._setStatus(COLLECT_PAGE_HELP_STATUS.timeout);
      } else {
        logger.error('Open collect page error:', error);
        this._setStatus(COLLECT_PAGE_HELP_STATUS.fail);
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
      this._runningStatus = COLLECT_PAGE_HELP_RUNNING_STATUS.stateless;
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
    this._addEventHandler(COLLECT_PAGE_HELP_EVENTS.GET_STATUS, () => {
      return this._status;
    });
    this._addEventHandler(
      COLLECT_PAGE_HELP_EVENTS.REFRESH_RUNNING_STATUS,
      async () => {
        await this._refreshRunningStatus();
      },
    );
    this._addEventHandler(COLLECT_PAGE_HELP_EVENTS.GET_RUNNING_STATUS, () => {
      return this._runningStatus;
    });
    this._addEventHandler(
      COLLECT_PAGE_HELP_EVENTS.RETRY_OPEN_PAGE,
      async () => {
        await this._reopenThirdPartyPageView();
      },
    );
    this._addEventHandler(
      COLLECT_PAGE_HELP_EVENTS.BACK_TO_MAIN_VIEW,
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

  private _watchAnchorListFetch(): void {
    if (!this._thirdPartyView) {
      return;
    }
    const webContents = this._thirdPartyView.webContents;

    // 附加调试器
    if (!webContents.debugger.isAttached()) {
      try {
        webContents.debugger.attach('1.3');
        webContents.debugger.sendCommand('Network.enable');

        const anchorListRequestIdSet = new Set<string>();
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
              response.url.includes('/system/anchor/list') &&
              response.status === 200 &&
              postRequestIdSet.has(requestId)
            ) {
              anchorListRequestIdSet.add(requestId);
            }
          } else if (method === 'Network.loadingFinished') {
            if (anchorListRequestIdSet.has(params.requestId)) {
              try {
                // 获取响应体
                const responseBody = await webContents.debugger.sendCommand(
                  'Network.getResponseBody',
                  { requestId: params.requestId },
                );
                const { body } = responseBody;
                if (typeof body === 'string' && body.startsWith('{')) {
                  const json = JSON.parse(body);
                  if (json.code === 0) {
                    const anchorList = json.rows as AnchorFrom87RawData[];
                    const resp = await createOrUpdateAnchorFrom87({
                      list: anchorList,
                      org_id: MOCK_ORG_ID,
                    });
                    if (resp.status_code === RESPONSE_CODE.SUCCESS) {
                      this._helpView?.webContents.send(
                        COLLECT_PAGE_HELP_EVENTS.ANCHOR_LIST_FETCHED,
                        { anchorList, createCount: resp.data!.created_count },
                      );
                    }
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

  async show() {
    try {
      this._addEventHandlers();
      const onResize = () => {
        this._onResize();
      };
      this._parentWindow.on('resize', onResize);
      this._removeResizeListener = onResize;
      await this._openHelpView();
      await this._openThirdPartyPageView();
    } catch (error) {
      console.error('Error loading URL:', error);
    }
  }

  close() {
    this._removeResizeListener?.();
    this._removeResizeListener = null;
    this._removeEventHandlers();
    this._closeThirdPartyPageView();
    this._closeHelpView();
    this._setStatus(COLLECT_PAGE_HELP_STATUS.stateless);
  }

  destroy() {
    this.close();
  }
}
