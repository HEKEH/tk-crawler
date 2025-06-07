import type { Subscription } from 'rxjs';
import type { CustomRouteRecord } from '../router/route-records';
import type { GuildAccountsManageContext } from './guild-accounts-manage';
import { CRAWL_EVENTS } from '@tk-crawler-admin-client/shared';
import {
  hasAdminPrivilege,
  type SystemUserLoginRequest,
  type SystemUserLoginSuccessData,
} from '@tk-crawler/biz-shared';
import { isInElectronApp } from '@tk-crawler/electron-utils/render';
import {
  InitializationState,
  MessageCenter,
  RESPONSE_CODE,
} from '@tk-crawler/shared';
import { TokenInvalidSubject } from '@tk-crawler/view-shared';
import { markRaw } from 'vue';
import { login, loginByToken } from '../requests';
import { MainRouteRecords, redirectToLogin } from '../router';
import { LoginRouteRecord } from '../router/route-records';
import { Page } from '../types';
import { getToken, removeToken, setToken } from '../utils';
import ClientManage from './client-manage';
import CrawlerManage from './crawler-manage';
import { GuildAccountsManage } from './guild-accounts-manage';
import { UserProfile } from './user-profile';

export default class GlobalStore implements GuildAccountsManageContext {
  private _crawlerManage: CrawlerManage;

  private _clientManage: ClientManage;

  private _guildAccountsManage: GuildAccountsManage;

  private _currentPage: Page | null = null;

  private _userProfile = new UserProfile();

  private _initializationState = new InitializationState();

  private _token = '';

  private _tokenInvalidSubscription: Subscription | null = null;

  readonly messageCenter = markRaw(new MessageCenter());

  get crawlerManage() {
    return this._crawlerManage;
  }

  get clientManage() {
    return this._clientManage;
  }

  get guildAccountsManage() {
    return this._guildAccountsManage;
  }

  get currentPage() {
    return this._currentPage;
  }

  get userProfile() {
    return this._userProfile;
  }

  get isInitializing() {
    return this._initializationState.isPending;
  }

  get hasInitializeError() {
    return this._initializationState.hasInitializeError;
  }

  get token() {
    return this._token;
  }

  constructor() {
    this._crawlerManage = new CrawlerManage();
    this._clientManage = new ClientManage();
    this._guildAccountsManage = new GuildAccountsManage(this);
  }

  async refreshUserProfile() {
    const resp = await loginByToken(this._token);
    if (resp.status_code === RESPONSE_CODE.SUCCESS) {
      this._userProfile.init(resp.data!);
    }
  }

  private _handleLoginSuccess(data: SystemUserLoginSuccessData) {
    this._userProfile.init(data);
    this._guildAccountsManage.start();
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
    this._currentPage = Page.Login;
    await redirectToLogin();
  }

  async goToPage(page: Page) {
    if (page === Page.Login) {
      await this._gotoLoginPage();
      return;
    }
    this._currentPage = page;
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

  get primaryMenu() {
    return this.allPages.find(item => item.isPrimary) ?? this.allPages[0];
  }

  get allPages() {
    let records: CustomRouteRecord[] = [];
    if (!this.userProfile.hasLoggedIn) {
      records = [LoginRouteRecord];
    } else {
      records = MainRouteRecords.filter(item => {
        return (
          !item.privilege ||
          hasAdminPrivilege(this.userProfile.role!, item.privilege)
        );
      });
    }
    if (isInElectronApp()) {
      records = records.filter(item => !item.only || item.only === 'electron');
    } else {
      records = records.filter(item => !item.only || item.only === 'web');
    }
    return records.map(item => ({
      menu: item.menu,
      name: item.name,
      path: item.path,
      jumpTo: item.jumpTo,
      isPrimary: item.isPrimary,
    }));
  }

  async login(params: SystemUserLoginRequest) {
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
    await this.clear();
    if (isInElectronApp()) {
      await window.ipcRenderer.invoke(CRAWL_EVENTS.CLEAR_TIKTOK_COOKIE);
    }
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
      await this._loginByToken();
      this._initializationState.initializeComplete();
    } catch (error) {
      console.error(error);
      this._initializationState.initializeError(error as Error);
      throw error;
    }
  }

  setCurrentMenu(menu: Page | null) {
    this._currentPage = menu;
  }

  async clear() {
    this.messageCenter.clear();
    await this._guildAccountsManage.clear();
    this._userProfile.clear();
    await this.crawlerManage.destroy();
  }

  async destroy() {
    if (this._tokenInvalidSubscription) {
      this._tokenInvalidSubscription.unsubscribe();
      this._tokenInvalidSubscription = null;
    }
    await this.clear();
  }
}
