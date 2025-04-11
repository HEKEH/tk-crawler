import type { MessageCenter } from '@tk-crawler/shared';
import type {
  ChannelSubTagMap,
  DrawerSubTab,
  TikTokQueryTokens,
} from '@tk-crawler/tk-requests';
import type { Subscription } from 'rxjs';
import type { RawAnchorParam } from './anchor-pool';
import {
  tiktokRequestErrorHandler,
  TKRequestMessage,
} from '@tk-crawler/biz-shared';
import {
  getRandomArrayElementWithWeight,
  IntervalRunner,
  setIntervalImmediate,
} from '@tk-crawler/shared';
import {
  ChannelId,
  DRAWER_TABS_SCENE,
  getChannelParamsByChannelId,
  getDrawerTabs,
  getFeed,
  getQueryTokens,
  getRandomChannelId,
} from '@tk-crawler/tk-requests';
import { getLogger } from '../infra/logger';
import { AnchorPool } from './anchor-pool';

const TOKEN_UPDATE_INTERVAL = 5000; // 5s更新一次

const UPDATE_CHANNEL_SUB_TAGS_INTERVAL = 300000; // 5分钟更新一次

/** 爬虫逻辑 */
export class LiveAnchorCrawler {
  private _intervals: {
    [key in
      | 'updateTokensInterval'
      | 'updateChannelSubTagsInterval']?: NodeJS.Timeout;
  } = {};

  // private _settings?: LiveAnchorCrawlerSettings;

  private _isRunning = false;

  private _queryId: number = Math.random();

  private _anchorPool: AnchorPool;

  private _queryTokens: TikTokQueryTokens = {
    verifyFp: '',
    msToken: '',
  };

  private _channelSubTagsMap: ChannelSubTagMap = {};

  private _crawlIntervalRunner = new IntervalRunner();

  private _crawlerInterval: number;

  private _messageCenter: MessageCenter;

  private _onCookieOutdatedSubscription: Subscription;

  constructor(props: {
    crawlerInterval: number;
    messageCenter: MessageCenter;
  }) {
    this._crawlerInterval = props.crawlerInterval;
    this._messageCenter = props.messageCenter;
    this._anchorPool = new AnchorPool({
      messageCenter: this._messageCenter,
    });
    this._onCookieOutdatedSubscription = this._messageCenter.addListener(
      TKRequestMessage.TIKTOK_COOKIE_OUTDATED,
      () => {
        this.stop();
      },
    );
  }

  private _updateTokens() {
    this._queryTokens = getQueryTokens();
    this._anchorPool.updateQueryTokens(this._queryTokens);
  }

  private async _updateChannelSubTags(scene: DRAWER_TABS_SCENE) {
    try {
      const queryId = this._queryId;
      const { data } = await tiktokRequestErrorHandler(
        getDrawerTabs({
          region: 'all',
          tokens: this._queryTokens,
          scene,
        }),
        this._messageCenter,
      );
      const outdated = queryId !== this._queryId;
      if (outdated) {
        return;
      }
      if (data) {
        const updateMap = (channelId: ChannelId, subTab: DrawerSubTab) => {
          const findItem = this._channelSubTagsMap[channelId]!.find(
            item => item.tag === subTab.tab_type,
          );
          if (!findItem) {
            this._channelSubTagsMap[channelId]!.push({
              tag: subTab.tab_type,
              weight: subTab.viewer_count, // 根据观众数作为权重
            });
          } else {
            findItem.weight = subTab.viewer_count; // 更新权重
          }
        };
        for (const tab of data) {
          if (tab.tab_type === 'gaming' || tab.tab_type === 'lifestyle') {
            // gaming对应1111006
            const channelId =
              tab.tab_type === 'gaming'
                ? ChannelId.GAMING_WITH_TAG
                : ChannelId.LIFESTYLE_WITH_TAG;
            if (!this._channelSubTagsMap[channelId]) {
              this._channelSubTagsMap[channelId] = [];
            }

            for (const subTab of tab.sub_tabs) {
              updateMap(channelId, subTab);
            }
          } else {
            for (const subTab of tab.sub_tabs) {
              const channelId =
                subTab.rank_type === 'hot_game'
                  ? ChannelId.GAMING_WITH_TAG
                  : ChannelId.LIFESTYLE_WITH_TAG;
              if (!this._channelSubTagsMap[channelId]) {
                this._channelSubTagsMap[channelId] = [];
              }
              updateMap(channelId, subTab);
            }
          }
        }
      }
    } catch (error) {
      getLogger().error('[updateChannelSubTags] error', error);
    }
  }

  private async _crawl() {
    try {
      const queryId = this._queryId;
      getLogger().debug('发起一轮新查询');
      const channelId = getRandomChannelId();
      const channelParams = getChannelParamsByChannelId(
        channelId,
        Object.fromEntries(
          Object.entries(this._channelSubTagsMap).map(([key, value]) => [
            key,
            [...value],
          ]),
        ) as ChannelSubTagMap,
      );
      const feed = await tiktokRequestErrorHandler(
        getFeed({
          region: 'all',
          tokens: this._queryTokens,
          channelParams,
        }),
        this._messageCenter,
      );
      const outdated = queryId !== this._queryId;
      if (outdated) {
        return;
      }
      if (feed.data) {
        const anchorInfos: RawAnchorParam[] = [];
        for (const item of feed.data) {
          const anchor = item.data?.owner;
          if (anchor) {
            const roomId = item.data.id_str;
            // const streamDataStr =
            //   item.data.stream_url?.live_core_sdk_data?.pull_data?.stream_data;
            // const streamData = streamDataStr
            //   ? JSON.parse(streamDataStr)
            //   : undefined;
            // 这个字段并不是真正的主播等级
            // const level = streamData?.common?.peer_anchor_level as
            //   | number
            //   | undefined;

            // 无法获取主播等级，暂时设置为0
            const level = 0;
            anchorInfos.push({
              user_id: anchor.id_str,
              display_id: anchor.display_id,
              room_id: roomId,
              follower_count: anchor.follow_info.follower_count ?? 0,
              level: level ?? null,
              audience_count: item.data.user_count ?? null,
              has_commerce_goods: item.data.has_commerce_goods ?? null,
              tag: item.data.hashtag?.title ?? null,
            });
          }
        }
        await this._anchorPool.addAnchors(anchorInfos);
      }
    } catch (error) {
      getLogger().error('[feed] error', error);
    }
  }

  private async _run() {
    this._intervals.updateTokensInterval = setIntervalImmediate(() => {
      this._updateTokens();
    }, TOKEN_UPDATE_INTERVAL);

    await this._updateChannelSubTags(DRAWER_TABS_SCENE.INIT);

    this._intervals.updateChannelSubTagsInterval = setInterval(() => {
      this._updateChannelSubTags(
        getRandomArrayElementWithWeight([
          [DRAWER_TABS_SCENE.INIT, 1],
          [DRAWER_TABS_SCENE.UPDATE, 3], // update场景更新频率更高
        ]),
      );
    }, UPDATE_CHANNEL_SUB_TAGS_INTERVAL);

    this._crawlIntervalRunner.start(() => this._crawl(), {
      intervalTime: this._crawlerInterval,
    });
  }

  async start() {
    this.stop();
    this._anchorPool.start();
    getLogger().info('start live anchor crawler');
    this._isRunning = true;
    this._queryId = Math.random();
    await this._run();
  }

  stop() {
    if (!this._isRunning) {
      return;
    }
    this._isRunning = false;
    getLogger().info('stop live anchor crawler');
    Object.values(this._intervals).forEach(interval => {
      clearInterval(interval);
    });
    this._crawlIntervalRunner.stop();
    this._anchorPool.stop();
  }

  clear() {
    this._onCookieOutdatedSubscription.unsubscribe();
    this.stop();
  }
}
