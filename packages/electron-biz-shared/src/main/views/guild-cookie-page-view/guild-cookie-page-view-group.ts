import type { TKGuildUser } from '@tk-crawler/biz-shared';
import { ConcurrentLimitTaskQueue, type Logger } from '@tk-crawler/shared';
import {
  getGuildCookiePageViewKey,
  GuildCookiePageView,
  type StartTKGuildUserAccount,
} from './guild-cookie-page-view';

export const viewOpenTaskQueue = new ConcurrentLimitTaskQueue(3);

export class GuildCookiePageViewGroup {
  private _views: GuildCookiePageView[] = [];

  private _onAllClose: (() => void) | undefined;

  private _logger: Logger;

  private _isDevelopment: boolean;

  private _helpPageUrl: string;

  private _startTKGuildUserAccount: StartTKGuildUserAccount;

  private _iconPath?: string;

  constructor(props: {
    logger: Logger;
    isDevelopment: boolean;
    helpPageUrl: string;
    startTKGuildUserAccount: StartTKGuildUserAccount;
    iconPath?: string;
    onAllClose?: () => void;
  }) {
    this._onAllClose = props.onAllClose;
    this._logger = props.logger;
    this._isDevelopment = props.isDevelopment;
    this._helpPageUrl = props.helpPageUrl;
    this._startTKGuildUserAccount = props.startTKGuildUserAccount;
    this._iconPath = props.iconPath;
  }

  private _createCookiePageView(guildUser: TKGuildUser) {
    const viewKey = getGuildCookiePageViewKey(guildUser);
    let view = this._views.find(view => view.key === viewKey);
    if (view) {
      return view;
    }
    view = new GuildCookiePageView({
      onClose: () => {
        this._onCloseView(viewKey);
      },
      logger: this._logger,
      isDevelopment: this._isDevelopment,
      helpPageUrl: this._helpPageUrl,
      iconPath: this._iconPath,
      startTKGuildUserAccount: this._startTKGuildUserAccount,
      guildUser,
    });
    this._views.push(view);
    return view;
  }

  async openCookiePage(data: { guildUser: TKGuildUser | TKGuildUser[] }) {
    if (Array.isArray(data.guildUser)) {
      const views = data.guildUser.map(guildUser =>
        this._createCookiePageView(guildUser),
      );
      for (const view of views) {
        viewOpenTaskQueue.addTask(async () => {
          if (view.isClosed) {
            return;
          }
          await view.show();
        });
      }
    } else {
      const view = this._createCookiePageView(data.guildUser);
      await view.show();
    }
  }

  private _onCloseView(viewKey: string) {
    this._views = this._views.filter(v => v.key !== viewKey);
    if (this._views.length === 0) {
      this._onAllClose?.();
    }
  }

  destroy() {
    this._views.forEach(view => {
      view.destroy();
    });
    this._views = [];
  }
}
