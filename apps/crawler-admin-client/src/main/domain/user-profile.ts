import type {
  SystemAdminUserInfo,
  SystemUserLoginSuccessData,
} from '@tk-crawler/biz-shared';

export class UserProfile {
  private _userInfo: Omit<SystemAdminUserInfo, 'password'> | null;

  constructor() {
    this._userInfo = null;
  }

  get hasLoggedIn() {
    return Boolean(this._userInfo);
  }

  initAfterLoginSuccess(data: SystemUserLoginSuccessData) {
    this._userInfo = data.user_info;
  }

  get userInfo(): Readonly<Omit<SystemAdminUserInfo, 'password'>> | null {
    return this._userInfo;
  }

  clear() {
    this._userInfo = null;
  }
}
