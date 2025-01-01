import type { DrawerSubTab } from '../requests/drawer-tabs';
import type { TikTokQueryTokens } from '../requests/types';
import config from '../config';
import { IntervalRunner } from '../infra/interval-runner';
import { logger } from '../infra/logger';
import { ChannelId } from '../requests/constants';
import getDrawerTabs, { DRAWER_TABS_SCENE } from '../requests/drawer-tabs';
import getFeed from '../requests/feed';
import {
  type ChannelSubTagMap,
  getChannelParamsByChannelId,
  getMessageToken,
  getRandomChannelId,
  getVerifyFp,
} from '../requests/utils/params';
import { Region } from '../types/region';
import {
  getRandomArrayElementWithWeight,
  setIntervalImmediate,
} from '../utils';
import UserCollection from './user-collection';

const TOKEN_UPDATE_INTERVAL = 60000; // 60s更新一次

const UPDATE_CHANNEL_SUB_TAGS_INTERVAL = 300000; // 5分钟更新一次

/** 爬虫逻辑 */
class Crawler {
  private _intervals: {
    [key in
      | 'updateTokensInterval'
      | 'updateChannelSubTagsInterval']?: NodeJS.Timeout;
  } = {};

  /** 爬取的地区，默认英国 */
  private _region: Region | 'all' = Region.GB;

  private _userCollection = new UserCollection({
    regions: this._region === 'all' ? 'all' : [this._region],
  });

  private _queryTokens: TikTokQueryTokens = {
    verifyFp: '',
    msToken: '',
  };

  private _channelSubTagsMap: ChannelSubTagMap = {};

  private _crawlIntervalRunner = new IntervalRunner();

  constructor() {}

  private _updateTokens() {
    this._queryTokens.verifyFp = getVerifyFp();
    this._queryTokens.msToken = getMessageToken();
  }

  private async _updateChannelSubTags(scene: DRAWER_TABS_SCENE) {
    const { data } = await getDrawerTabs({
      region: this._region,
      tokens: this._queryTokens,
      scene,
    });
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
  }

  private async _crawl() {
    try {
      logger.trace('发起一轮新查询');
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
      const feed = await getFeed({
        region: this._region,
        tokens: this._queryTokens,
        channelParams,
      });
      if (feed.data) {
        const users = feed.data
          .map(item => item.data?.owner)
          .filter(Boolean)
          .map(user => ({
            id: user.id_str,
            display_id: user.display_id,
            nickname: user.nickname,
            bio_description: user.bio_description,
          }));
        await this._userCollection.addUsers(users);
      }
    } catch (error) {
      logger.error('[feed] error', error);
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
      intervalTime: config.crawlerInterval,
    });
  }

  async start() {
    logger.info('start crawler');
    await this._run();
  }

  stop() {
    logger.info('stop crawler');
    Object.values(this._intervals).forEach(interval => {
      clearInterval(interval);
    });
    this._crawlIntervalRunner.stop();
  }
}

export default Crawler;
