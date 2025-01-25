import type { Region } from '@tk-crawler/shared';
import { getLogger } from '../infra/logger';
import { getAnchorRegion } from '../requests/live';
import { type AnchorCheckInfo, batchCheckAnchor } from '../requests/live-admin';
import { TEMP_COOKIE } from '../requests/live-admin/constants';
import { type CollectedUserInfo, QualificationStatus } from '../types';
import { limitedPromiseAll } from '../utils/limited-promise-all';

type UserParam = Omit<CollectedUserInfo, 'region' | 'qualified'>;

/** 当前主播的集合 */
export default class UserCollection {
  private _regions: Region[] | 'all';
  private _allUserIds: Set<string> = new Set();
  private _allUsers: CollectedUserInfo[] = [];

  /** 批量审核主播的限制，最高不能超过官方规定的30 */
  private _batchCheckAnchorLimit = 10;

  /** TODO: 临时cookie */
  private _live_admin_cookie: string = TEMP_COOKIE;

  private _awaitedCheckedUsers: CollectedUserInfo[] = [];
  constructor({ regions }: { regions: Region[] | 'all' }) {
    if (regions !== 'all' && !regions?.length) {
      throw new Error('Invalid regions');
    }
    this._regions = regions;
  }

  private _isAnchorQualified(anchor: AnchorCheckInfo) {
    return Boolean(
      anchor.AnchorStatus === 0 &&
        anchor.MultiAccountNotMeetBasicQualification === false &&
        anchor.CanUseInvitationType?.length,
    );
  }

  private async _triggerCheckUsers() {
    while (this._awaitedCheckedUsers.length >= this._batchCheckAnchorLimit) {
      const users = this._awaitedCheckedUsers.slice(
        0,
        this._batchCheckAnchorLimit,
      );
      this._awaitedCheckedUsers = this._awaitedCheckedUsers.slice(
        this._batchCheckAnchorLimit,
      );
      const result = await batchCheckAnchor({
        displayIds: users.map(user => user.display_id),
        cookie: this._live_admin_cookie,
      });
      if (result.status_code === 0) {
        const data = result.data;
        if (data?.AnchorList?.length) {
          for (const anchor of data.AnchorList) {
            const user = users.find(
              user => user.display_id === anchor.UserBaseInfo.DisplayID,
            );
            if (user) {
              user.qualified = this._isAnchorQualified(anchor)
                ? QualificationStatus.QUALIFIED
                : QualificationStatus.UNQUALIFIED;
            } else {
              getLogger().error('[triggerCheckUsers] User not found', {
                anchor,
              });
            }
          }
        }
      }
      for (const user of users) {
        if (user.qualified === QualificationStatus.NOT_CHECKED) {
          /** 仍然丢回队列，等待下一次检查 */
          this._awaitedCheckedUsers.push(user);
        } else {
          getLogger().info('找到一个可邀约主播', user);
          this._allUsers.push(user);
        }
      }
    }
  }

  async addUsers(users: UserParam[]) {
    await limitedPromiseAll(
      users.map(user => () => this.addUser(user)),
      8, // 限制并发数
    );
  }

  async addUser(user: UserParam) {
    if (this._allUserIds.has(user.id)) {
      return;
    }
    this._allUserIds.add(user.id);
    let userInfo: CollectedUserInfo;
    const region = await getAnchorRegion({ userDisplayId: user.display_id });
    if (region) {
      userInfo = {
        ...user,
        region: region as Region,
        qualified: QualificationStatus.NOT_CHECKED,
      };
    } else {
      getLogger().error('[addUser] Get user region failed', {
        user,
      });
      this._allUserIds.delete(user.id);
      return;
    }
    this._allUsers.push(userInfo);
    if (this._regions === 'all' || this._regions.includes(userInfo.region)) {
      this._awaitedCheckedUsers.push(userInfo);
      this._triggerCheckUsers();
    }
  }
}
