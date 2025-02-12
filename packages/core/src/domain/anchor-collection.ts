import type { Region } from '@tk-crawler/shared';
import type { CollectedAnchorInfo } from '../types';
import { getLogger } from '../infra/logger';
import { getAnchorRegion } from '../requests/live';
import { limitedPromiseAll } from '../utils/limited-promise-all';

type AnchorParam = Omit<CollectedAnchorInfo, 'region'>;

/** 当前主播的集合 */
export default class AnchorCollection {
  private _allUserIds: Set<string> = new Set();
  private _allUsers: CollectedAnchorInfo[] = [];

  async addAnchors(anchors: AnchorParam[]) {
    await limitedPromiseAll(
      anchors.map(anchor => () => this.addAnchor(anchor)),
      8, // 限制并发数
    );
  }

  async addAnchor(anchor: AnchorParam) {
    if (this._allUserIds.has(anchor.id)) {
      return;
    }
    this._allUserIds.add(anchor.id);
    let userInfo: CollectedAnchorInfo;
    const region = await getAnchorRegion({ userDisplayId: anchor.display_id });
    if (region) {
      userInfo = {
        ...anchor,
        region: region as Region,
      };
    } else {
      getLogger().error('[addUser] Get user region failed', {
        user: anchor,
      });
      this._allUserIds.delete(anchor.id);
      return;
    }
    this._allUsers.push(userInfo);
  }
}
