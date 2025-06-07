import type { Subscription } from 'rxjs';
import type { CustomRouteRecord } from '../router/route-records';
import type { Menu } from '../types';
import type { GuildAccountsManageContext } from './guild-accounts-manage';
import {
  hasClientPrivilege,
  type OrgMemberLoginRequest,
  type OrgMemberLoginSuccessData,
} from '@tk-crawler/biz-shared';
import {
  InitializationState,
  MessageCenter,
  RESPONSE_CODE,
} from '@tk-crawler/shared';
import { MessageQueue, TokenInvalidSubject } from '@tk-crawler/view-shared';
import { markRaw } from 'vue';
import { login, loginByToken } from '../requests';
import { redirectToLogin } from '../router';
import {
  AnchorManagementRouteRecord,
  AutoContactManagementRouteRecord,
  GuildManagementRouteRecord,
  HomeRouteRecord,
  SystemManagementRouteRecord,
} from '../router/route-records';
import { getToken, removeToken, setToken } from '../utils';
import { GuildAccountsManage } from './guild-accounts-manage';
import { UserProfile } from './user-profile';

export default class GlobalStore implements GuildAccountsManageContext {
  currentMenu: Menu | null = null;
  private _initializationState = new InitializationState();
  private _token = '';

  private _userProfile = new UserProfile();

  private _guildAccountsManage = new GuildAccountsManage(this);

  private _messageQueue = markRaw(
    new MessageQueue({
      messageOffset: 200,
    }),
  );

  private _tokenInvalidSubscription: Subscription | null = null;

  readonly messageCenter = markRaw(new MessageCenter());

  get primaryMenu() {
    return this.menus.find(item => item.isPrimary) ?? this.menus[0];
  }

  get menus() {
    let records: CustomRouteRecord[] = [];
    if (!this.userProfile.hasLoggedIn) {
      records = [HomeRouteRecord];
    } else {
      records = [
        HomeRouteRecord,
        AnchorManagementRouteRecord,
        AutoContactManagementRouteRecord,
        SystemManagementRouteRecord,
        GuildManagementRouteRecord,
      ].filter(item => {
        return (
          !item.privilege ||
          hasClientPrivilege(this.userProfile.role!, item.privilege)
        );
      });
    }
    return records.map(item => ({
      menu: item.menu,
      name: item.name,
      path: item.path,
      jumpTo: item.jumpTo,
      isPrimary: item.isPrimary,
    }));
  }

  get userProfile() {
    return this._userProfile;
  }

  get guildAccountsManage() {
    return this._guildAccountsManage;
  }

  // get isInitialized() {
  //   return this._initializationState.isInitialized;
  // }

  get isInitializing() {
    return this._initializationState.isPending;
  }

  get hasInitializeError() {
    return this._initializationState.hasInitializeError;
  }

  get token() {
    return this._token;
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
    this._guildAccountsManage.start();
  }

  private async _loginByToken() {
    try {
      const token = await getToken();
      if (token) {
        this._token = token;
        const resp = await loginByToken(token);
        if (resp.status_code === RESPONSE_CODE.SUCCESS) {
          this._handleLoginSuccess(resp.data!);
          return;
        }
      }
      this._userProfile.clear();
    } catch (error) {
      this._userProfile.clear();
      throw error;
    }
  }

  private _subscribeTokenInvalid() {
    if (this._tokenInvalidSubscription) {
      this._tokenInvalidSubscription.unsubscribe();
    }
    this._tokenInvalidSubscription = markRaw(
      TokenInvalidSubject.subscribe(() => {
        this._gotoLoginPage();
      }),
    );
  }

  private async _gotoLoginPage() {
    this._userProfile.clear();
    await this._guildAccountsManage.clear();
    await redirectToLogin();
  }

  async login(params: OrgMemberLoginRequest) {
    const resp = await login(params);
    if (resp.status_code === RESPONSE_CODE.SUCCESS) {
      const data = resp.data!;
      this._token = data.token;
      await setToken(data.token);
      this._handleLoginSuccess(data);
    }
    return resp;
  }

  async logout() {
    await removeToken();
    await this._clear();
    await redirectToLogin();
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
      this._subscribeTokenInvalid();
      this._addEventListeners();
      await this._loginByToken();
      this._initializationState.initializeComplete();
    } catch (error) {
      console.error(error);
      this._initializationState.initializeError(error as Error);
      throw error;
    }
  }

  private async _clear() {
    this._token = '';
    await this._guildAccountsManage.clear();
    this._userProfile.clear();
    // this._removeEventListeners();
  }

  async destroy() {
    if (this._tokenInvalidSubscription) {
      this._tokenInvalidSubscription.unsubscribe();
      this._tokenInvalidSubscription = null;
    }
    await this._clear();
  }
}
