import type { MessageCenter } from '@tk-crawler/shared';
import type { Subscription } from 'rxjs';
import type { TkPagesWindow } from './tk-pages-window';
import type { IView } from './types';
import path from 'node:path';
import process from 'node:process';
import { BaseWindow } from 'electron';
import { MainView } from './main-view';
import { TKLoginView } from './tk-login-view';

export class ViewsManager {
  private _baseWindow: BaseWindow;

  private _currentView: IView | null = null;

  private _mainView: MainView;

  private _tkLoginView: TKLoginView;

  private _tkPagesWindow: TkPagesWindow | null = null;

  private _messageCenter: MessageCenter;

  private _subscriptions: Subscription[] = [];

  private _userIds: string[] = [];
  private _executeIndex: number = 0;

  constructor(props: { messageCenter: MessageCenter }) {
    this._messageCenter = props.messageCenter;
    this._baseWindow = new BaseWindow({
      fullscreen: true,
      icon: path.join(process.env.VITE_PUBLIC, 'appicon.svg'),
    });
    this._mainView = new MainView({
      parentWindow: this._baseWindow,
      messageCenter: this._messageCenter,
    });
    this._tkLoginView = new TKLoginView({
      parentWindow: this._baseWindow,
    });
  }

  async show() {
    this._currentView = this._mainView;
    await this._mainView.show();
    this._baseWindow.show();
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

  async startExecute(userIds: string[]) {
    this._userIds = userIds;
    this._executeIndex = 0;
    await this._changeView(this._tkLoginView);
  }

  private _clearSubscriptions() {
    this._subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this._subscriptions = [];
  }

  close() {
    this._closeCurrentView();
    this._baseWindow.close();
  }

  get allViews() {
    return [this._mainView, this._tkLoginView];
  }

  destroy() {
    this._clearSubscriptions();
    this._currentView = null;
    this.allViews.forEach(view => {
      view.destroy();
    });
    this._baseWindow.close();
  }
}
