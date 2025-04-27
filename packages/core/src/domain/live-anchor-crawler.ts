import type { Area, SimpleCrawlStatistics } from '@tk-crawler/biz-shared';
import type { MessageCenter } from '@tk-crawler/shared';
import type {
  ChannelSubTagMap,
  DrawerSubTab,
  TikTokQueryTokens,
} from '@tk-crawler/tk-requests';
import type { Subscription } from 'rxjs';
import type { RawAnchorParam } from './anchor-pool';
import {
  getRegionsByArea,
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

const CRAWL_SUSPEND_TIMEOUT = 1000 * 60 * 3; // 3分钟

const CONTINUOUS_ERRORS_THRESHOLD = 5;

/** 爬虫逻辑 */
export class LiveAnchorCrawler {
  private _crawlArea: Area | 'all' = 'all';

  private _crawlStartTime: Date | undefined;
  private _anchorUpdateTimes: number = 0;

  private _feedNumber = 0;
  private _intervals: {
    [key in
      | 'updateTokensInterval'
      | 'updateChannelSubTagsInterval']?: NodeJS.Timeout;
  } = {};

  // private _settings?: LiveAnchorCrawlerSettings;

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

  private _isRunning = false;

  /** 记录连续出现的错误 */
  private _continuousErrors: Error[] = [];

  /** 因错误而暂停 */
  private _isSuspended = false;

  private _suspendedTimeout: NodeJS.Timeout | null = null;

  get isSuspended() {
    return this._isSuspended;
  }

  get isRunning() {
    return this._isRunning;
  }

  get crawlArea() {
    return this._crawlArea;
  }

  get simpleCrawlStatistics(): SimpleCrawlStatistics {
    return {
      anchorUpdateTimes: this._anchorUpdateTimes,
      crawlStartTime: this._crawlStartTime,
      feedNumber: this._feedNumber,
    };
  }

  setCrawlArea(crawlArea: Area | 'all') {
    this._crawlArea = crawlArea;
  }

  constructor(props: {
    crawlerInterval: number;
    messageCenter: MessageCenter;
  }) {
    this._crawlerInterval = props.crawlerInterval;
    this._messageCenter = props.messageCenter;
    this._anchorPool = new AnchorPool({
      messageCenter: this._messageCenter,
      onAnchorUpdated: _ => {
        this._onAnchorUpdated();
      },
    });
    this._onCookieOutdatedSubscription = this._messageCenter.addListener(
      TKRequestMessage.TIKTOK_COOKIE_OUTDATED,
      () => {
        this.stop();
      },
    );
  }

  private _onAnchorUpdated() {
    this._anchorUpdateTimes++;
  }

  private _updateTokens() {
    this._queryTokens = getQueryTokens();
    this._anchorPool.updateQueryTokens(this._queryTokens);
  }

  private async _updateChannelSubTags(scene: DRAWER_TABS_SCENE) {
    try {
      const queryId = this._queryId;
      const result = await tiktokRequestErrorHandler(
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
      if (result.data) {
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
        for (const tab of result.data) {
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
      } else if (result.message) {
        getLogger().error(
          '[updateChannelSubTags] business error',
          result.message,
        );
      } else {
        getLogger().error('[updateChannelSubTags] unknown error', result);
      }
    } catch (error) {
      getLogger().error('[updateChannelSubTags] error', error);
    }
  }

  private async _crawl() {
    try {
      if (this._isSuspended) {
        return;
      }
      const queryId = this._queryId;
      getLogger().debug('发起一轮新查询');
      const channelId = getRandomChannelId();
      const channelSubTagMap = Object.fromEntries(
        Object.entries(this._channelSubTagsMap).map(([key, value]) => [
          key,
          [...value],
        ]),
      ) as ChannelSubTagMap;
      const channelParams = getChannelParamsByChannelId(
        channelId,
        channelSubTagMap,
      );
      const feed = await tiktokRequestErrorHandler(
        getFeed({
          region:
            this._crawlArea === 'all'
              ? 'all'
              : getRegionsByArea(this._crawlArea),
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
        this._feedNumber++;
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
        this._continuousErrors = [];
      } else if (feed.message) {
        getLogger().error('[feed] business error', feed.message);
      } else {
        getLogger().error('[feed] unknown error', feed);
      }
    } catch (error) {
      getLogger().error('[feed] error', error);
      if (this._isSuspended) {
        return;
      }
      this._continuousErrors.push(error as Error);
      if (this._continuousErrors.length >= CONTINUOUS_ERRORS_THRESHOLD) {
        this._suspend();
      }
    }
  }

  private _suspend() {
    this._isSuspended = true;
    this._continuousErrors = [];
    this._anchorPool.suspend();
    this._suspendedTimeout = setTimeout(() => {
      this._isSuspended = false;
      this._anchorPool.resume();
    }, CRAWL_SUSPEND_TIMEOUT);
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

    this._crawlStartTime = new Date();
    this._anchorUpdateTimes = 0;
    this._feedNumber = 0;

    await this._run();
  }

  stop() {
    if (!this._isRunning) {
      return;
    }
    this._isRunning = false;
    if (this._suspendedTimeout) {
      clearTimeout(this._suspendedTimeout);
      this._suspendedTimeout = null;
    }
    this._isSuspended = false;
    getLogger().info('stop live anchor crawler');
    Object.values(this._intervals).forEach(interval => {
      clearInterval(interval);
    });
    this._crawlIntervalRunner.stop();
    this._anchorPool.stop();

    this._crawlStartTime = undefined;
    this._anchorUpdateTimes = 0;
    this._feedNumber = 0;
  }

  clear() {
    this._onCookieOutdatedSubscription.unsubscribe();
    this.stop();
  }
}
