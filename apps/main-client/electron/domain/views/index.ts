import type { TKGuildUser } from '@tk-crawler/biz-shared';
import type { MessageCenter } from '@tk-crawler/shared';
import type { Subscription } from 'rxjs';
import type { IView } from './types';
import path from 'node:path';
import process from 'node:process';
import { BaseWindow } from 'electron';
import { CookiePageView } from './cookie-page-view';
import { MainView } from './main-view';

export class ViewsManager {
  private _baseWindow: BaseWindow | null = null;

  private _currentView: IView | null = null;

  private _mainView: MainView | null = null;

  private _cookiePageView: CookiePageView | null = null;

  private _messageCenter: MessageCenter;

  private _subscriptions: Subscription[] = [];

  private _onClose: () => void;

  private get allViews() {
    return [this._mainView, this._cookiePageView];
  }

  private _clearAllViewVariables() {
    this._mainView = null;
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
      icon: path.join(process.env.VITE_PUBLIC, 'appicon.svg'),
      autoHideMenuBar: true,
    });
    this._mainView = new MainView({
      parentWindow: this._baseWindow,
      messageCenter: this._messageCenter,
    });
    this._cookiePageView = new CookiePageView({
      parentWindow: this._baseWindow,
      backToMainView: () => {
        this._toMainView();
      },
    });
    this._baseWindow.on('close', this._onClose);
  }

  async show() {
    // 初试视图
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

  async openCookiePage(data: { guildUser: TKGuildUser }) {
    console.log('[OPEN COOKIE PAGE]', data);
    await this._changeView(this._cookiePageView!);
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
