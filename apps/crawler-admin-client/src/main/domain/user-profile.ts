import {
  type AdminPrivilege,
  hasAdminPrivilege,
  type SystemAdminUserInfo,
  SystemAdminUserRole,
  type SystemUserLoginSuccessData,
} from '@tk-crawler/biz-shared';

export class UserProfile {
  private _userInfo: Omit<SystemAdminUserInfo, 'password'> | null;

  constructor() {
    this._userInfo = null;
  }

  get userId() {
    return this._userInfo?.id;
  }

  get isAdmin() {
    return this._userInfo?.role_id === SystemAdminUserRole.ADMIN;
  }

  hasPrivilege(privilege: AdminPrivilege) {
    if (!this._userInfo) {
      return false;
    }
    return hasAdminPrivilege(this._userInfo.role_id, privilege);
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
