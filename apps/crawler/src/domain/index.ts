import type { TikTokQueryTokens } from '../requests/types';
import config from '../config';
import { LANGUAGE } from '../constants';
import { logger } from '../infra/logger';
import { ChannelId } from '../requests/constants';
import getDrawerTabs, {
  DRAWER_TABS_SCENE,
  DRAWER_TABS_SCENES,
} from '../requests/drawer-tabs';
import getFeed from '../requests/feed';
import {
  type ChannelSubTagMap,
  getChannelParamsByChannelId,
  getMessageToken,
  getRandomChannelId,
  getVerifyFp,
} from '../requests/utils/params';
import { getRandomArrayElement, setIntervalImmediate } from '../utils';

const TOKEN_UPDATE_INTERVAL = 60000; // 60s更新一次

const UPDATE_CHANNEL_SUB_TAGS_INTERVAL = 300000; // 5分钟更新一次

/** 爬虫逻辑 */
class Crawler {
  private _intervals: {
    [key in
      | 'crawlInterval'
      | 'updateTokensInterval'
      | 'updateChannelSubTagsInterval']?: NodeJS.Timeout;
  } = {};

  private _userIds: Set<string> = new Set();
  private _queryTokens: TikTokQueryTokens = {
    verifyFp: '',
    msToken: '',
  };

  private _channelSubTagsMap: {
    [key in ChannelId]?: Set<string>;
  } = {};

  constructor() {}

  private _updateTokens() {
    this._queryTokens.verifyFp = getVerifyFp();
    this._queryTokens.msToken = getMessageToken();
  }

  private async _updateChannelSubTags(scene: DRAWER_TABS_SCENE) {
    const drawerTabs = await getDrawerTabs({
      lng: LANGUAGE['ZH-CN'],
      tokens: this._queryTokens,
      scene,
    });
    if (drawerTabs.data) {
      for (const tab of drawerTabs.data) {
        if (tab.tab_type === 'gaming' || tab.tab_type === 'lifestyle') {
          // gaming对应1111006
          const channelId =
            tab.tab_type === 'gaming'
              ? ChannelId.GAMING_WITH_TAG
              : ChannelId.LIFESTYLE_WITH_TAG;
          if (!this._channelSubTagsMap[channelId]) {
            this._channelSubTagsMap[channelId] = new Set();
          }

          for (const subTab of tab.sub_tabs) {
            this._channelSubTagsMap[channelId].add(subTab.tab_type);
          }
        } else {
          for (const subTab of tab.sub_tabs) {
            const channelId =
              subTab.rank_type === 'hot_game'
                ? ChannelId.GAMING_WITH_TAG
                : ChannelId.LIFESTYLE_WITH_TAG;
            if (!this._channelSubTagsMap[channelId]) {
              this._channelSubTagsMap[channelId] = new Set();
            }
            this._channelSubTagsMap[channelId].add(subTab.tab_type);
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
        lng: LANGUAGE['ZH-CN'],
        tokens: this._queryTokens,
        channelParams,
      });
      if (feed.data) {
        for (const item of feed.data) {
          const userInfo = item.data?.owner;
          if (userInfo && !this._userIds.has(userInfo.id_str)) {
            this._userIds.add(userInfo.id_str);
            logger.info(`找到第${this._userIds.size}个主播:`, {
              id: userInfo.id_str,
              nickname: userInfo.nickname,
              bio_description: userInfo.bio_description || '',
            });
          }
        }
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
      this._updateChannelSubTags(getRandomArrayElement(DRAWER_TABS_SCENES));
    }, UPDATE_CHANNEL_SUB_TAGS_INTERVAL);

    this._intervals.crawlInterval = setIntervalImmediate(() => {
      this._crawl();
    }, config.crawlerInterval);
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
  }
}

export default Crawler;
