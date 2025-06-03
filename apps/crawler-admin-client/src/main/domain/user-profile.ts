import {
  type AdminPrivilege,
  hasAdminPrivilege,
  shouldCharge,
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

  get needToCharge() {
    return this._userInfo ? shouldCharge(this._userInfo) : false;
  }

  get chargeBasePrice() {
    return this._userInfo?.base_price ?? 0;
  }

  get chargeFollowPrice() {
    return this._userInfo?.follow_price ?? 0;
  }

  get balance() {
    const balance = this._userInfo?.balance;
    return balance;
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

  init(data: SystemUserLoginSuccessData) {
    this._userInfo = data.user_info;
  }

  get userInfo(): Readonly<Omit<SystemAdminUserInfo, 'password'>> | null {
    return this._userInfo;
  }

  clear() {
    this._userInfo = null;
  }
}
