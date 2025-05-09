import type { UserProfile } from './user-profile';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { ElMessageBox } from 'element-plus';
import { isAnyGuildUserAccountError } from '../requests';
import router from '../router';
import { GuildManagementRouteRecord } from '../router/route-records';
import { localStorageStore } from '../utils';

export interface GuildAccountsManageContext {
  readonly token: string | undefined;
  readonly userProfile: UserProfile;
}

const IGNORE_ERROR_KEY = 'guild-accounts-manage-ignore-error';

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

  async checkIsAnyAccountError() {
    if (!this._context.userProfile.hasLoggedIn || !this._context.token) {
      this._isAnyAccountError = false;
      return;
    }

    const response = await isAnyGuildUserAccountError({}, this._context.token);
    if (response.status_code === RESPONSE_CODE.SUCCESS) {
      this._isAnyAccountError = response.data!.has_error;
      if (!this._isAnyAccountError) {
        localStorageStore.removeItem(IGNORE_ERROR_KEY);
      }
    } else {
      console.error(response.message);
    }
  }

  private async _handleIsAnyAccountErrorOrStart() {
    if (!this._context.userProfile.isAdmin) {
      return;
    }

    if (localStorageStore.getItem(IGNORE_ERROR_KEY) === 1) {
      return;
    }

    if (this._isAnyAccountError) {
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
        router.push(
          GuildManagementRouteRecord.jumpTo ?? GuildManagementRouteRecord.path,
        );
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
      1000 * 60, // 1 minute
    );
    await this.checkIsAnyAccountError();
    this._handleIsAnyAccountErrorOrStart();
  }

  clear() {
    this._isAnyAccountError = false;
    this._clearCheckInterval();
  }
}
