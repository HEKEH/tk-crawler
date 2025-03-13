import {
  type OrganizationItem,
  type OrgMemberItem,
  type OrgMemberLoginSuccessData,
  OrgMemberStatus,
} from '@tk-crawler/biz-shared';

export enum MembershipStatus {
  normal = 'normal',
  /** 过期 */
  expired = 'expired',
  /** 非会员 */
  not_member = 'not_member',
}

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

  get userInfo(): Readonly<Omit<OrgMemberItem, 'password'>> | null {
    return this._userInfo;
  }

  get orgInfo(): Readonly<Omit<OrganizationItem, 'user_count'>> | null {
    return this._orgInfo;
  }

  get membershipStatus(): MembershipStatus {
    if (this._userInfo?.status === OrgMemberStatus.normal) {
      return MembershipStatus.normal;
    }
    if (this._orgInfo?.membership_expire_at) {
      return MembershipStatus.expired;
    }
    return MembershipStatus.not_member;
  }

  clear() {
    this._userInfo = null;
    this._orgInfo = null;
  }
}
