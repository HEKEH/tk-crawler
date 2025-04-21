import type {
  SystemUserLoginRequest,
  SystemUserLoginSuccessData,
} from '@tk-crawler/biz-shared';
import type { Subscription } from 'rxjs';
import {
  InitializationState,
  MessageCenter,
  RESPONSE_CODE,
} from '@tk-crawler/shared';
import { TokenInvalidSubject } from '@tk-crawler/view-shared';
import { markRaw } from 'vue';
import { login, loginByToken } from '../requests';
import { Page } from '../types';
import { getToken, removeToken, setToken } from '../utils';
import ClientManage from './client-manage';
import CrawlerManage from './crawler-manage';
import { UserProfile } from './user-profile';

export default class GlobalStore {
  private _crawlerManage: CrawlerManage;

  private _clientManage: ClientManage;
  private _currentPage: Page = Page.Crawler;

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

  get currentPage() {
    return this._currentPage;
  }

  get userProfile() {
    return this._userProfile;
  }

  get token() {
    return this._token;
  }

  constructor() {
    this._crawlerManage = new CrawlerManage();
    this._clientManage = new ClientManage();
  }

  private _handleLoginSuccess(data: SystemUserLoginSuccessData) {
    this._userProfile.initAfterLoginSuccess(data);
  }

  private _subscribeTokenInvalid() {
    if (this._tokenInvalidSubscription) {
      this._tokenInvalidSubscription.unsubscribe();
    }
    this._tokenInvalidSubscription = TokenInvalidSubject.subscribe(() => {
      this._gotoLoginPage();
    });
  }

  private _gotoLoginPage() {
    this._currentPage = Page.Login;
  }

  private async _loginByToken() {
    const token = await getToken();
    if (token) {
      this._token = token;
      const resp = await loginByToken(token);
      if (resp.status_code === RESPONSE_CODE.SUCCESS) {
        this._handleLoginSuccess(resp.data!);
      }
    } else {
      this._gotoLoginPage();
    }
  }

  async login(params: SystemUserLoginRequest) {
    const resp = await login(params);
    if (resp.status_code === RESPONSE_CODE.SUCCESS) {
      const data = resp.data!;
      this._token = data.token;
      await setToken(data.token);
      this._handleLoginSuccess(data);
      this._currentPage = Page.Crawler;
    }
    return resp;
  }

  async logout() {
    await removeToken();
    await this.clear();
    this._gotoLoginPage();
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
      this._initializationState.reset();
      throw error;
    }
  }

  async initCrawlerManage() {
    await this.crawlerManage.init();
  }

  setCurrentMenu(menu: Page) {
    this._currentPage = menu;
  }

  async clear() {
    this.messageCenter.clear();
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
