import { RESPONSE_CODE, setIntervalImmediate } from '@tk-crawler/shared';
import { isAnyGuildUserAccountError } from '../requests';

export interface GuildAccountsManageContext {
  readonly token: string | undefined;
  readonly hasLoggedIn: boolean;
}

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
    if (!this._context.hasLoggedIn || !this._context.token) {
      this._isAnyAccountError = false;
      return;
    }

    const response = await isAnyGuildUserAccountError({}, this._context.token);
    if (response.status_code === RESPONSE_CODE.SUCCESS) {
      this._isAnyAccountError = response.data!.has_error;
    } else {
      console.error(response.message);
    }
  }

  start() {
    this._clearCheckInterval();
    this._checkInterval = setIntervalImmediate(
      () => {
        this.checkIsAnyAccountError();
      },
      1000 * 60, // 1 minute
    );
  }

  clear() {
    this._clearCheckInterval();
  }
}
