import type {
  StartTKLiveAdminAccountRequest,
  TKGuildUser,
} from '@tk-crawler/biz-shared';
import type { Subscription } from 'rxjs';
import type { IView } from './types';
import { PRODUCT_NAME } from '@tk-crawler-admin-client/shared';
import { GuildCookiePageView } from '@tk-crawler/electron-biz-shared/main';
import { type MessageCenter, RESPONSE_CODE } from '@tk-crawler/shared';
import { app, BaseWindow } from 'electron';
import config from '../../config';
import { isDevelopment } from '../../env';
import { logger } from '../../infra';
import { startTKGuildUserAccount } from '../../requests';
import { saveTiktokCookie } from '../services/cookie';
import { getToken } from '../services/token';
import { MainView } from './main-view';
import { TKLoginView } from './tk-login-view';

async function activateTKGuildUserAccount(
  params: Omit<StartTKLiveAdminAccountRequest, 'faction_id' | 'area'>,
) {
  const token = getToken();
  if (!token) {
    logger.error('[cookie-page-view] finishActivate: Token is not found');
    return {
      status_code: RESPONSE_CODE.BIZ_ERROR,
      message: 'Token is not found',
    };
  }
  return startTKGuildUserAccount(params, token);
}

export class ViewsManager {
  private _baseWindow: BaseWindow | null = null;

  private _currentView: IView | null = null;

  private _mainView: MainView | null = null;

  private _tkLoginView: TKLoginView | null = null;

  private _cookiePageView: GuildCookiePageView | null = null;

  private _messageCenter: MessageCenter;

  private _subscriptions: Subscription[] = [];

  private _onClose: () => void;

  private get allViews() {
    return [this._mainView, this._tkLoginView, this._cookiePageView];
  }

  private _clearAllViewVariables() {
    this._mainView = null;
    this._tkLoginView = null;
    this._cookiePageView = null;
  }

  constructor(props: { messageCenter: MessageCenter; onClose: () => void }) {
    this._messageCenter = props.messageCenter;
    this._onClose = props.onClose;
  }

  init() {
    this._baseWindow = new BaseWindow({
      width: 1200,
      height: 800,
      title: `${PRODUCT_NAME} ${app.getVersion()}`,
      // icon: path.join(process.env.VITE_PUBLIC, 'appicon.svg'),
      autoHideMenuBar: true,
    });
    this._mainView = new MainView({
      parentWindow: this._baseWindow,
      messageCenter: this._messageCenter,
    });
    this._tkLoginView = new TKLoginView({
      parentWindow: this._baseWindow,
      context: this,
    });
    this._cookiePageView = new GuildCookiePageView({
      parentWindow: this._baseWindow,
      backToMainView: () => {
        this._toMainView();
      },
      logger,
      isDevelopment,
      helpPageUrl: `${config.mainWebUrl}guild-cookie-page-help.html`,
      startTKGuildUserAccount: activateTKGuildUserAccount,
    });
    this._baseWindow.on('close', this._onClose);
  }

  async show() {
    this._currentView = this._mainView;
    await this._currentView?.show();
    this._baseWindow?.show();
  }

  private async _toMainView() {
    await this._changeView(this._mainView!);
  }

  private _closeCurrentView() {
    if (this._currentView) {
      this._currentView.close();
      this._currentView = null;
    }
  }

  private async _changeView(view: IView) {
    if (this._currentView === view) {
      return;
    }
    this._closeCurrentView();
    this._currentView = view;
    await this._currentView.show();
  }

  async submitCookies(cookies: [string, string][] | string) {
    saveTiktokCookie(cookies);
    if (this._mainView) {
      await this._changeView(this._mainView);
      this._mainView.onCookiesUpdated();
    }
  }

  async openCookiePage(data: { guildUser: TKGuildUser }) {
    this._cookiePageView!.setGuildUser(data.guildUser);
    await this._changeView(this._cookiePageView!);
  }

  async openTkLoginPage() {
    await this._changeView(this._tkLoginView!);
  }

  openMainView() {
    if (this._mainView) {
      this._changeView(this._mainView);
    }
  }

  private _clearSubscriptions() {
    this._subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this._subscriptions = [];
  }

  close() {
    this._closeCurrentView();
    if (this._baseWindow?.isVisible()) {
      this._baseWindow.close();
    }
  }

  destroy() {
    this._clearSubscriptions();
    this.allViews.forEach(view => {
      view?.destroy();
    });
    if (this._baseWindow && !this._baseWindow.isDestroyed()) {
      this._baseWindow.removeAllListeners();
      this._baseWindow.destroy();
      this._baseWindow = null;
    }
    this._currentView = null;
    this._clearAllViewVariables();
  }
}
