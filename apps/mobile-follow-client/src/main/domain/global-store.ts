import type { AnchorFollowGroupItem } from '@tk-crawler/biz-shared';
import { RequestErrorType } from '@tk-crawler/biz-shared';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import { MessageCenter } from '@tk-crawler/shared';
import { MessageQueue } from '@tk-crawler/view-shared';
import {
  CheckNetworkResultType,
  MOCK_ORG_ID,
} from '@tk-mobile-follow-client/shared';
import { markRaw, toRaw } from 'vue';
import { CUSTOM_EVENTS } from '../constants';
import { checkNetwork } from '../requests';
import { Menu } from '../types';

export default class GlobalStore {
  private _currentMenu: Menu = Menu.Entry;

  private _isInitialized: boolean = false;

  /** TODO: 获取当前机构id，目前是demo id */
  get orgId() {
    return MOCK_ORG_ID;
  }

  private _networkStatus: CheckNetworkResultType =
    CheckNetworkResultType.SUCCESS;

  private _messageQueue = markRaw(
    new MessageQueue({
      messageOffset: 200,
    }),
  );

  readonly messageCenter = markRaw(new MessageCenter());

  get currentMenu() {
    return this._currentMenu;
  }

  get isInitialized() {
    return this._isInitialized;
  }

  get networkStatus() {
    return this._networkStatus;
  }

  private _eventListeners: Array<
    [string, (event: Electron.IpcRendererEvent, ...args: any[]) => void]
  > = [];

  private _addEventListener(
    event: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
  ) {
    this._eventListeners.push([event, listener]);
    ElectronRenderListeners.getInstance().on(event, listener);
  }

  private _addEventListeners() {
    this._addEventListener(
      CUSTOM_EVENTS.REQUEST_ERROR,
      (_, errorType: RequestErrorType) => {
        let message: string;
        if (errorType === RequestErrorType.TIKTOK_REQUEST_ECONNRESET) {
          message =
            '连接失败，请检查网络是否有异常，例如是否开启了VPN，且VPN是否开启了全局代理';
        } else if (errorType === RequestErrorType.TIKTOK_REQUEST_TIMEOUT) {
          message =
            '请求超时，请检查网络是否有异常，例如是否开启了VPN，且VPN是否开启了全局代理';
        } else {
          message = '请求失败，请检查网络是否有异常';
        }
        this._messageQueue.showMessage({
          message,
          type: 'error',
        });
      },
    );
  }

  private _removeEventListeners() {
    this._eventListeners.forEach(([event, listener]) => {
      ElectronRenderListeners.getInstance().off(event, listener);
    });
    this._eventListeners = [];
  }

  private async _checkNetwork() {
    this._networkStatus = await checkNetwork();
  }

  async retryCheckNetwork() {
    this._isInitialized = false;
    await this._checkNetwork();
    this._isInitialized = true;
  }

  async init() {
    this._addEventListeners();
    await this._checkNetwork();
    this._isInitialized = true;
  }

  setCurrentMenu(menu: Menu) {
    this._currentMenu = menu;
  }

  async goToCollectPage() {
    await window.ipcRenderer.invoke(CUSTOM_EVENTS.GO_TO_COLLECT_PAGE);
  }

  async goToCollectPageWithGroup(group: AnchorFollowGroupItem) {
    await window.ipcRenderer.invoke(
      CUSTOM_EVENTS.GO_TO_COLLECT_PAGE_WITH_GROUP,
      toRaw(group),
    );
  }

  clear() {
    this._messageQueue.destroy();
    this._removeEventListeners();
  }
}
