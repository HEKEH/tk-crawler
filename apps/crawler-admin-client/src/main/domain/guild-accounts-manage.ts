import type { UserProfile } from './user-profile';
import { TK_GUILD_USER_EVENTS } from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { ElMessageBox } from 'element-plus';
import { getSettings } from '../hooks';
import { isAnyGuildAccountError } from '../requests';
import { Page } from '../types';
import { localStorageStore } from '../utils';

export interface GuildAccountsManageContext {
  readonly token: string | undefined;
  readonly userProfile: UserProfile;
  readonly goToPage: (page: Page) => void;
}

const IGNORE_ERROR_KEY = 'system-guild-accounts-manage-ignore-error';

export class GuildAccountsManage {
  private _context: GuildAccountsManageContext;
  private _isAnyAccountError: boolean = false;

  private _checkInterval: NodeJS.Timeout | null = null;

  constructor(context: GuildAccountsManageContext) {
    this._context = context;
  }

  get isAnyAccountError() {
    return this._isAnyAccountError;
  }

  private _clearCheckInterval() {
    if (this._checkInterval) {
      clearInterval(this._checkInterval);
      this._checkInterval = null;
    }
  }

  private async _setIsAnyAccountError(isAnyAccountError: boolean) {
    this._isAnyAccountError = isAnyAccountError;
    if (window.ipcRenderer) {
      try {
        await window.ipcRenderer.invoke(
          TK_GUILD_USER_EVENTS.IS_ANY_GUILD_USER_ERROR,
          isAnyAccountError,
          getSettings().error_sound_time,
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  async checkIsAnyAccountError() {
    if (!this._context.userProfile.hasLoggedIn || !this._context.token) {
      await this._setIsAnyAccountError(false);
      return;
    }

    const response = await isAnyGuildAccountError({}, this._context.token);
    if (response.status_code === RESPONSE_CODE.SUCCESS) {
      await this._setIsAnyAccountError(response.data!.has_error);
      if (!this._isAnyAccountError) {
        localStorageStore.removeItem(IGNORE_ERROR_KEY);
      }
    } else {
      console.error(response.message);
    }
  }

  private async _handleIsAnyAccountErrorOrStart() {
    if (this._isAnyAccountError) {
      if (localStorageStore.getItem(IGNORE_ERROR_KEY) === 1) {
        return;
      }
      try {
        await ElMessageBox.confirm(
          '某些公会账号登录已过期或出错，请及时处理!',
          {
            title: '警告',
            type: 'warning',
            confirmButtonText: '去处理',
            cancelButtonText: '忽略',
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
          },
        );
        this._context.goToPage(Page.GuildManage);
      } catch {
        localStorageStore.setItem(IGNORE_ERROR_KEY, 1);
      }
    }
  }

  async start() {
    this._clearCheckInterval();
    this._checkInterval = setInterval(
      () => {
        this.checkIsAnyAccountError();
      },
      1000 * 60 * 2, // 2 minutes
    );
    await this.checkIsAnyAccountError();
    this._handleIsAnyAccountErrorOrStart();
  }

  async clear() {
    await this._setIsAnyAccountError(false);
    this._clearCheckInterval();
  }
}
