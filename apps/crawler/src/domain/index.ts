import type { TikTokQueryTokens } from '../requests/types';
import config from '../config';
import { LANGUAGE } from '../constants';
import { logger } from '../infra/logger';
import getFeed from '../requests/feed';
import { getMessageToken, getVerifyFp } from '../requests/utils/params';
import { setIntervalImmediate } from '../utils';

/** 爬虫逻辑 */
class Crawler {
  private _crawlInterval: NodeJS.Timeout | undefined;
  private _updateTokensInterval: NodeJS.Timeout | undefined;
  private _userIds: Set<string> = new Set();
  private _queryTokens: TikTokQueryTokens = {
    verifyFp: '',
    msToken: '',
  };

  constructor() {}

  private _updateTokens() {
    this._queryTokens.verifyFp = getVerifyFp();
    this._queryTokens.msToken = getMessageToken();
  }

  private async _crawl() {
    try {
      logger.trace('发起一轮新查询');
      const feed = await getFeed({
        lng: LANGUAGE['ZH-CN'],
        tokens: this._queryTokens,
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
    this._updateTokensInterval = setIntervalImmediate(() => {
      this._updateTokens();
    }, 60000); // 60s更新一次
    this._crawlInterval = setIntervalImmediate(() => {
      this._crawl();
    }, config.crawlerInterval);
  }

  start() {
    logger.info('crawler start');
    this._run();
  }

  stop() {
    logger.info('crawler stop');
    clearInterval(this._crawlInterval);
    clearInterval(this._updateTokensInterval);
  }
}

export default Crawler;
