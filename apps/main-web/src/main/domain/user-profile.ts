import type {
  OrganizationItem,
  OrgMemberItem,
  OrgMemberLoginSuccessData,
} from '@tk-crawler/biz-shared';

export class UserProfile {
  private _userInfo: Omit<OrgMemberItem, 'password'> | null;
  private _orgInfo: Omit<OrganizationItem, 'user_count'> | null;

  constructor() {
    this._userInfo = null;
    this._orgInfo = null;
  }

  get hasLoggedIn() {
    return Boolean(this._userInfo);
  }

  initAfterLoginSuccess(data: OrgMemberLoginSuccessData) {
    this._userInfo = data.user_info;
    this._orgInfo = data.org_info;
  }

  // get userInfo() {
  //   return this._userInfo;
  // }

  // get orgInfo() {
  //   return this._orgInfo;
  // }

  clear() {
    this._userInfo = null;
    this._orgInfo = null;
  }
}
