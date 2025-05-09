import type {
  OrgAnchorSearchPolicies,
  OrganizationItem,
  OrgMemberItem,
  OrgMemberLoginSuccessData,
} from '@tk-crawler/biz-shared';
import { OrgMemberRole } from '@tk-crawler/biz-shared';

export enum MembershipStatus {
  /** 会员 */
  has_membership = 'has_membership',
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

  get userId() {
    return this._userInfo?.id;
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
    if (this._orgInfo?.if_membership_valid) {
      return MembershipStatus.has_membership;
    }
    if (this._orgInfo?.membership_expire_at) {
      return MembershipStatus.expired;
    }
    return MembershipStatus.not_member;
  }

  get hasMembership() {
    return this.membershipStatus === MembershipStatus.has_membership;
  }

  get role() {
    return this._userInfo?.role_id;
  }

  get isAdmin() {
    return this._userInfo?.role_id === OrgMemberRole.admin;
  }

  get searchAnchorPolicies(): OrgAnchorSearchPolicies {
    return {
      ignore_commerce_anchor: this.orgInfo!.ignore_commerce_anchor,
    };
  }

  setSearchAnchorPolicies(policies: OrgAnchorSearchPolicies) {
    this._orgInfo!.ignore_commerce_anchor = policies.ignore_commerce_anchor;
  }

  clear() {
    this._userInfo = null;
    this._orgInfo = null;
  }
}
