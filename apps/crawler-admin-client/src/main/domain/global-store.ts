import type { Subscription } from 'rxjs';
import type { GuildAccountsManageContext } from './guild-accounts-manage';
import { CRAWL_EVENTS } from '@tk-crawler-admin-client/shared';
import {
  AdminPrivilege,
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

  private _handleLoginSuccess(data: SystemUserLoginSuccessData) {
    this._userProfile.initAfterLoginSuccess(data);
    this._currentPage = this.allPages[0].key;
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

  private _gotoLoginPage() {
    this._userProfile.clear();
    this._currentPage = Page.Login;
  }

  goToPage(page: Page) {
    if (page === Page.Login) {
      this._gotoLoginPage();
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
      this._gotoLoginPage();
    } catch (error) {
      this._userProfile.clear();
      this._gotoLoginPage();
      throw error;
    }
  }

  get allPages() {
    if (!this.userProfile.hasLoggedIn) {
      return [
        {
          key: Page.Login,
          name: '登录',
        },
      ];
    }
    let pageList: {
      key: Page;
      name: string;
      privilege: AdminPrivilege;
      onlyApp?: boolean;
    }[] = [
      {
        key: Page.Crawler,
        name: '爬虫管理',
        privilege: AdminPrivilege.CRAWLER_MANAGEMENT,
        onlyApp: true,
      },
      {
        key: Page.Client,
        name: '客户管理',
        privilege: AdminPrivilege.CLIENT_MANAGEMENT,
      },
      {
        key: Page.GuildManage,
        name: '公会管理',
        privilege: AdminPrivilege.GUILD_MANAGEMENT,
      },
    ];
    if (!isInElectronApp()) {
      pageList = pageList.filter(page => !page.onlyApp);
    }
    return pageList.filter(page =>
      this.userProfile.hasPrivilege(page.privilege),
    );
  }

  async login(params: SystemUserLoginRequest) {
    const resp = await login(params);
    if (resp.status_code === RESPONSE_CODE.SUCCESS) {
      const data = resp.data!;
      this._token = data.token;
      await setToken(data.token);
      this._handleLoginSuccess(data);
      this._currentPage = this.allPages[0].key;
    }
    return resp;
  }

  async logout() {
    await removeToken();
    await this.clear();
    await window.ipcRenderer.invoke(CRAWL_EVENTS.CLEAR_TIKTOK_COOKIE);
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
      this._initializationState.initializeError(error as Error);
      throw error;
    }
  }

  setCurrentMenu(menu: Page) {
    this._currentPage = menu;
  }

  async clear() {
    this.messageCenter.clear();
    this._guildAccountsManage.clear();
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
