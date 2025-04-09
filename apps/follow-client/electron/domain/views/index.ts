import type { MessageCenter } from '@tk-crawler/shared';
import type { Subscription } from 'rxjs';
import type { TkLoginViewContext } from './tk-login-view';
import type { IView } from './types';
import path from 'node:path';
import process from 'node:process';
import { PRODUCT_NAME } from '@tk-follow-client/shared';
import { app, BaseWindow } from 'electron';
import { MainView } from './main-view';
import { TKAutoFollowView } from './tk-auto-follow-view';
import { TKLoginView } from './tk-login-view';

export class ViewsManager implements TkLoginViewContext {
  private _baseWindow: BaseWindow | null = null;

  private _currentView: IView | null = null;

  private _mainView: MainView | null = null;

  private _tkLoginView: TKLoginView | null = null;

  private _tkAutoFollowView: TKAutoFollowView | null = null;

  private _messageCenter: MessageCenter;

  private _subscriptions: Subscription[] = [];

  private _onClose: () => void;

  private get allViews() {
    return [this._mainView, this._tkLoginView, this._tkAutoFollowView];
  }

  private _clearAllViewVariables() {
    this._mainView = null;
    this._tkLoginView = null;
    this._tkAutoFollowView = null;
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
      title: `${PRODUCT_NAME} ${app.getVersion()}`,
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
    this._tkAutoFollowView = new TKAutoFollowView({
      parentWindow: this._baseWindow,
      goBack: () => {
        this._changeView(this._mainView!);
      },
    });
    this._baseWindow.on('close', this._onClose);
  }

  async show() {
    this._currentView = this._tkLoginView;
    await this._currentView?.show();
    this._baseWindow?.show();
  }

  async onTikTokLoginConfirmed() {
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

  async startAutoFollow(userIds: string[]) {
    this._tkAutoFollowView!.updateUserIds(userIds);
    await this._changeView(this._tkAutoFollowView!);
  }

  /** 回到登录页 */
  async openTKLoginPage() {
    await this._changeView(this._tkLoginView!);
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
