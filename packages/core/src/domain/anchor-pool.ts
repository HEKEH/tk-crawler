import type { Region } from '@tk-crawler/shared';
import type { TikTokQueryTokens } from '../requests/live';
import type { CollectedAnchorInfo } from '../types';
import { FrequencyLimitTaskQueue } from '@tk-crawler/shared';
import { getLogger } from '../infra/logger';
import {
  getAnchorInfoFromEnter,
  getAnchorInfoFromGiftList,
  getLiveDiamonds,
} from '../requests/live';

export type RawAnchorParam = Pick<CollectedAnchorInfo, 'id' | 'display_id'> & {
  room_id: string;
};

/** 当前主播的集合 */
export default class AnchorPool {
  private _region: Region[] | 'all' = 'all';
  private _anchorId2TimestampMap: Map<string, number> = new Map();
  private _allAnchors: CollectedAnchorInfo[] = [];

  private _taskQueue: FrequencyLimitTaskQueue = new FrequencyLimitTaskQueue({
    frequencyLimit: 20,
    onlyOneTask: true,
    taskInterval: 1000,
  });

  private _queryTokens: TikTokQueryTokens | undefined;

  constructor() {}

  private async _shouldIgnoreAnchor(anchorId: string): Promise<boolean> {
    // TODO 从redis中获取记录来进行判断
    if (!this._anchorId2TimestampMap.has(anchorId)) {
      return false;
    }
    const timestamp = this._anchorId2TimestampMap.get(anchorId)!;
    const now = Date.now();
    // 一小时之内爬到过就不更新
    return now - timestamp < 1000 * 60 * 60;
  }

  private async _recordAnchorId(anchorId: string) {
    // TODO 存储到redis
    this._anchorId2TimestampMap.set(anchorId, Date.now());
  }

  /** 删除主播id的缓存记录 */
  private async _deleteAnchorIdRecord(anchorId: string) {
    this._anchorId2TimestampMap.delete(anchorId);
  }

  /** 保存到数据库 */
  private async _saveAnchor(anchor: CollectedAnchorInfo) {
    // TODO: 保存到数据库
    getLogger().info('[saveAnchor] Save anchor info', { anchor });
    this._allAnchors.push(anchor);
  }

  async addAnchors(anchors: RawAnchorParam[]) {
    anchors.forEach(anchor => {
      this._taskQueue.addTask(() => this._addAnchor(anchor));
    });
  }

  private async _completeAnchorInfo(
    anchor: RawAnchorParam,
  ): Promise<CollectedAnchorInfo> {
    if (!this._queryTokens) {
      throw new Error('queryTokens is not set');
    }
    const [enterInfo, giftListInfo, liveDiamondsInfo] = await Promise.all([
      getAnchorInfoFromEnter({
        region: this._region,
        tokens: this._queryTokens,
        roomId: anchor.room_id,
      }),
      getAnchorInfoFromGiftList({
        region: this._region,
        tokens: this._queryTokens,
        roomId: anchor.room_id,
      }),
      getLiveDiamonds({
        region: this._region,
        tokens: this._queryTokens,
        anchorId: anchor.id,
        roomId: anchor.room_id,
      }),
    ]);
    if (
      enterInfo.status_code !== 0 ||
      giftListInfo.status_code !== 0 ||
      liveDiamondsInfo.status_code !== 0
    ) {
      throw new Error('Failed to get anchor info');
    }
    const enterInfoData = enterInfo.data!;
    const giftListInfoData = giftListInfo.data!;
    const liveDiamondsInfoData = liveDiamondsInfo.data!;
    return {
      id: anchor.id,
      display_id: anchor.display_id,
      region: giftListInfoData.region,
      follower_count: enterInfoData.follower_count,
      audience_count: enterInfoData.user_count,
      current_diamond: liveDiamondsInfoData.diamonds,
      // last_diamond: liveDiamondsInfoData.diamonds,
      // highest_diamond: liveDiamondsInfoData.diamonds,
      level: enterInfoData.level,
      rank_league: giftListInfoData.anchor_ranking_league,
    };
  }

  private async _addAnchor(anchor: RawAnchorParam) {
    if (await this._shouldIgnoreAnchor(anchor.id)) {
      return;
    }
    await this._recordAnchorId(anchor.id);
    try {
      const anchorInfo = await this._completeAnchorInfo(anchor);
      await this._saveAnchor(anchorInfo);
    } catch (error) {
      getLogger().error('[addAnchor] Add anchor info failed', {
        anchor,
        error,
      });
      await this._deleteAnchorIdRecord(anchor.id);
    }
  }

  updateQueryTokens(queryTokens: TikTokQueryTokens) {
    this._queryTokens = queryTokens;
  }
}
