import { RequestErrorType } from '@tk-crawler/biz-shared';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import { MessageCenter } from '@tk-crawler/shared';
import { MessageQueue } from '@tk-crawler/view-shared';
import { CheckNetworkResultType } from '@tk-mobile-follow-client/shared';
import { markRaw } from 'vue';
import { CUSTOM_EVENTS } from '../constants';
import { checkNetwork, startAutoFollow } from '../services';
import { Menu } from '../types';

export default class GlobalStore {
  private _currentMenu: Menu = Menu.Entry;

  private _isInitialized: boolean = false;

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

  async startAutoFollow(userIds: string[]) {
    await startAutoFollow(userIds);
  }

  async stop() {}

  setCurrentMenu(menu: Menu) {
    this._currentMenu = menu;
  }

  async switchTikTokAccount() {
    await window.ipcRenderer.invoke(CUSTOM_EVENTS.SWITCH_TIKTOK_ACCOUNT);
  }

  clear() {
    this._removeEventListeners();
  }
}
