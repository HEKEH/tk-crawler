import type {
  AnchorScrawledMessage,
  CollectedAnchorInfo,
  MessageCenter,
  Region,
} from '@tk-crawler/shared';
import type { TikTokQueryTokens } from '../requests/live';
import {
  CrawlerMessage,
  FrequencyLimitTaskQueue,
  getRequestErrorType,
  ShouldUpdateAnchorResult,
} from '@tk-crawler/shared';
import { getLogger } from '../infra/logger';
import { getAnchorInfoFromGiftList, getLiveDiamonds } from '../requests/live';
import {
  deleteAnchorCrawlRecord,
  recordAnchorCrawl,
  shouldUpdateAnchors,
  updateAnchor,
} from '../requests/own-server';

export type RawAnchorParam = Pick<
  CollectedAnchorInfo,
  | 'user_id'
  | 'display_id'
  | 'room_id'
  | 'follower_count'
  | 'audience_count'
  | 'level'
  | 'has_commerce_goods'
  | 'tag'
> & {
  room_id: string;
};

class StopScrawlError extends Error {
  constructor() {
    super('Stop scrawl');
  }
}

/** 当前主播的集合 */
export default class AnchorPool {
  private _region: Region[] | 'all' = 'all';
  private _anchorId2TimestampMap: Map<string, number> = new Map();

  private _taskQueue: FrequencyLimitTaskQueue = new FrequencyLimitTaskQueue({
    frequencyLimit: 300,
    onlyOneTask: false,
    // taskInterval: 1000,
  });

  private _stopped = true;

  private _queryTokens: TikTokQueryTokens | undefined;

  private _messageCenter: MessageCenter;

  constructor(props: { messageCenter: MessageCenter }) {
    this._messageCenter = props.messageCenter;
  }

  private _onCookieOutdated() {
    this._stopped = true;
    this._messageCenter.emit(CrawlerMessage.TIKTOK_COOKIE_OUTDATED);
  }

  start() {
    this._stopped = false;
  }

  stop() {
    this._stopped = true;
    this._taskQueue.clear();
  }

  private _shouldUpdateAnchors(anchorIds: string[]) {
    return shouldUpdateAnchors({ anchor_ids: anchorIds });
  }

  private async _recordAnchorCrawl(anchorId: string) {
    await recordAnchorCrawl({ anchor_id: anchorId });
  }

  /** 删除主播id的缓存记录 */
  private async _deleteAnchorCrawlRecord(anchorId: string) {
    await deleteAnchorCrawlRecord({ anchor_id: anchorId });
  }

  /** 保存到数据库 */
  private async _saveAnchor(anchor: CollectedAnchorInfo) {
    if (this._stopped) {
      throw new StopScrawlError();
    }
    getLogger().info('[SaveAnchor] To save anchor info:', { anchor });
    const response = await updateAnchor(anchor);
    if (response.status_code !== 0) {
      throw new Error(
        `[SaveAnchor] Failed to save anchor [${anchor.display_id}]: ${response.message}`,
      );
    }
    getLogger().info(
      `[SaveAnchor] Anchor info save success: ${anchor.display_id}`,
    );
    const data: AnchorScrawledMessage = { anchor };
    this._messageCenter.emit(CrawlerMessage.ANCHOR_SCRAWLED, data);
  }

  async addAnchors(anchors: RawAnchorParam[]) {
    if (this._stopped) {
      return;
    }
    try {
      const shouldUpdateAnchorIdsResponse = await this._shouldUpdateAnchors(
        anchors.map(anchor => anchor.user_id),
      );
      if (shouldUpdateAnchorIdsResponse.status_code !== 0) {
        return;
      }
      const shouldUpdateData = shouldUpdateAnchorIdsResponse.data!;
      anchors.forEach(anchor => {
        if (
          shouldUpdateData[anchor.user_id] ===
          ShouldUpdateAnchorResult.NEED_UPDATE
        ) {
          this._taskQueue.addTask(() => this._addAnchor(anchor));
        }
      });
    } catch (error) {
      getLogger().error('[addAnchors] error', error);
      this._messageCenter.emit(
        CrawlerMessage.REQUEST_ERROR,
        getRequestErrorType(error),
      );
    }
  }

  private _checkStatusCode(statusCode: number) {
    if (statusCode !== 0) {
      if (statusCode === 20003) {
        this._onCookieOutdated();
      }
      throw new Error('Failed to get anchor info');
    }
  }

  private async _completeAnchorInfo(
    anchor: RawAnchorParam,
  ): Promise<CollectedAnchorInfo> {
    if (!this._queryTokens) {
      throw new Error('queryTokens is not set');
    }
    const [giftListInfo, liveDiamondsInfo] = await Promise.all([
      getAnchorInfoFromGiftList({
        region: this._region,
        tokens: this._queryTokens,
        roomId: anchor.room_id,
      }),
      getLiveDiamonds({
        region: this._region,
        tokens: this._queryTokens,
        anchorId: anchor.user_id,
        roomId: anchor.room_id,
      }),
    ]);
    if (this._stopped) {
      throw new StopScrawlError();
    }
    this._checkStatusCode(giftListInfo.status_code);
    this._checkStatusCode(liveDiamondsInfo.status_code);
    const giftListInfoData = giftListInfo.data!;
    const liveDiamondsInfoData = liveDiamondsInfo.data!;
    return {
      user_id: anchor.user_id,
      display_id: anchor.display_id,
      room_id: anchor.room_id,
      region: giftListInfoData.region,
      follower_count: anchor.follower_count,
      audience_count: anchor.audience_count,
      level: anchor.level,
      current_diamonds: liveDiamondsInfoData.diamonds,
      // last_diamonds: liveDiamondsInfoData.diamonds,
      // highest_diamonds: liveDiamondsInfoData.diamonds,
      rank_league: giftListInfoData.anchor_ranking_league ?? null,
      has_commerce_goods: anchor.has_commerce_goods,
      tag: anchor.tag,
    };
  }

  private async _addAnchor(anchor: RawAnchorParam) {
    try {
      if (this._stopped) {
        throw new StopScrawlError();
      }
      const anchorInfo = await this._completeAnchorInfo(anchor);
      await this._saveAnchor(anchorInfo);
    } catch (error) {
      if (!(error instanceof StopScrawlError)) {
        getLogger().error('[addAnchor] Add anchor info failed', {
          anchor,
          error,
        });
        this._messageCenter.emit(
          CrawlerMessage.REQUEST_ERROR,
          getRequestErrorType(error),
        );
      }
      await this._deleteAnchorCrawlRecord(anchor.user_id);
    }
  }

  updateQueryTokens(queryTokens: TikTokQueryTokens) {
    this._queryTokens = queryTokens;
  }
}
