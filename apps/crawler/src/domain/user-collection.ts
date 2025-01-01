import type { CollectedUserInfo } from '../types';
import type { Region } from '../types/region';
import { logger } from '../infra/logger';
import getUserRegion from '../requests/get-user-region';
import { limitedPromiseAll } from '../utils/limited-promise-all';

type UserParam = Omit<CollectedUserInfo, 'region'> & { region?: Region };

/** 当前主播的集合 */
export default class UserCollection {
  private _regions: Region[] | 'all';
  private _allUserIds: Set<string> = new Set();
  private _allUsers: CollectedUserInfo[] = [];

  private _validUsers: CollectedUserInfo[] = [];
  constructor({ regions }: { regions: Region[] | 'all' }) {
    if (regions !== 'all' && !regions?.length) {
      throw new Error('Invalid regions');
    }
    this._regions = regions;
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
    if (user.region) {
      userInfo = user as CollectedUserInfo;
    } else {
      const region = await getUserRegion({ userDisplayId: user.display_id });
      if (region) {
        userInfo = {
          ...user,
          region: region as Region,
        };
      } else {
        logger.error('[addUser] Get user region failed', {
          user,
        });
        this._allUserIds.delete(user.id);
        return;
      }
    }
    this._allUsers.push(userInfo);
    if (this._regions === 'all' || this._regions.includes(userInfo.region)) {
      this._validUsers.push(userInfo);
      logger.info(`Added valid user #${this._validUsers.length}:`, {
        user: userInfo,
      });
    }
  }
}
