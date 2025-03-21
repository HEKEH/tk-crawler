import type {
  OrgMemberLoginRequest,
  OrgMemberLoginSuccessData,
} from '@tk-crawler/biz-shared';
import type { Menu } from '../types';
import {
  InitializationState,
  MessageCenter,
  RESPONSE_CODE,
} from '@tk-crawler/shared';
import { MessageQueue } from '@tk-crawler/view-shared';
import { markRaw } from 'vue';
import { login, loginByToken } from '../requests';
import { getToken, removeToken, setToken } from '../utils';
import { UserProfile } from './user-profile';

export default class GlobalStore {
  currentMenu: Menu | null = null;
  private _initializationState = new InitializationState();

  private _userProfile = new UserProfile();

  private _messageQueue = markRaw(
    new MessageQueue({
      messageOffset: 200,
    }),
  );

  readonly messageCenter = markRaw(new MessageCenter());

  get userProfile() {
    return this._userProfile;
  }

  get isInitialized() {
    return this._initializationState.isInitialized;
  }

  // private _eventListeners: Array<
  //   [string, (event: Electron.IpcRendererEvent, ...args: any[]) => void]
  // > = [];

  // private _addEventListener(
  //   event: string,
  //   listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
  // ) {
  //   this._eventListeners.push([event, listener]);
  //   ElectronRenderListeners.getInstance().on(event, listener);
  // }

  private _addEventListeners() {
    // this._addEventListener(
    //   CUSTOM_EVENTS.REQUEST_ERROR,
    //   (_, errorType: RequestErrorType) => {
    //     let message: string;
    //     if (errorType === RequestErrorType.TIKTOK_REQUEST_ECONNRESET) {
    //       message =
    //         '连接失败，请检查网络是否有异常，例如是否开启了VPN，且VPN是否开启了全局代理';
    //     } else if (errorType === RequestErrorType.TIKTOK_REQUEST_TIMEOUT) {
    //       message =
    //         '请求超时，请检查网络是否有异常，例如是否开启了VPN，且VPN是否开启了全局代理';
    //     } else {
    //       message = '请求失败，请检查网络是否有异常';
    //     }
    //     this._messageQueue.showMessage({
    //       message,
    //       type: 'error',
    //     });
    //   },
    // );
  }

  // private _removeEventListeners() {
  //   this._eventListeners.forEach(([event, listener]) => {
  //     ElectronRenderListeners.getInstance().off(event, listener);
  //   });
  //   this._eventListeners = [];
  // }

  private _handleLoginSuccess(data: OrgMemberLoginSuccessData) {
    this._userProfile.initAfterLoginSuccess(data);
  }

  private async _loginByToken() {
    const token = await getToken();
    if (token) {
      const resp = await loginByToken(token);
      if (resp.status_code === RESPONSE_CODE.SUCCESS) {
        this._handleLoginSuccess(resp.data!);
      }
    }
  }

  async login(params: OrgMemberLoginRequest) {
    const resp = await login(params);
    if (resp.status_code === RESPONSE_CODE.SUCCESS) {
      const data = resp.data!;
      await setToken(data.token);
      this._handleLoginSuccess(data);
    }
    return resp;
  }

  async logout() {
    await removeToken();
    this.clear();
  }

  async init() {
    if (this._initializationState.isInitialized) {
      return;
    }
    if (this._initializationState.isPending) {
      await this._initializationState.onInitialized();
      return;
    }
    try {
      this._initializationState.initializeBegin();
      this._addEventListeners();
      await this._loginByToken();
      this._initializationState.initializeComplete();
    } catch (error) {
      this._initializationState.reset();
      throw error;
    }
  }

  clear() {
    this._userProfile.clear();
    // this._removeEventListeners();
  }
}
