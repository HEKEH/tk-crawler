import type {
  AnchorFrom87RawData,
  AnchorRankLeague,
  Region,
} from '@tk-crawler/biz-shared';
import type { UpdateAnchorData } from '../services';
import type { Crawler } from './types';
import axios from 'axios';
import globalConfig from '../config';
import { logger } from '../infra/logger';
import { updateAnchor } from '../services';
import { ThirdPartyId } from '../types';

const COMMON_HEADERS = {
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7,zh-CN;q=0.6',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  Origin: 'http://tk.87cloud.cn',
  Pragma: 'no-cache',
  Referer: 'http://tk.87cloud.cn/system/anchor',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
};

const HEADERS = {
  ...COMMON_HEADERS,
  Cookie: globalConfig.tk87Cookie,
};

const BASE_PARAMS = {
  account: '',
  tag_title: '',
  canuse_invitation_type: '',
  source: '',
  pieces: '',
  popup_invitation_type: '',
  share_status: '',
  guanzhu_status: 'all',
  selectCountryCodes: '',
  gl_tag_title: '',
  'params[min_follower_count]': '0',
  'params[max_follower_count]': '',
  'params[min_day_diamond_val]': '',
  'params[max_day_diamond_val]': '',
  'params[min_last_day_diamond_val]': '',
  'params[max_last_day_diamond_val]': '',
  'params[min_his_max_diamond_val]': '0',
  'params[max_his_max_diamond_val]': '',
  'params[min_live_room_count]': '',
  'params[max_live_room_count]': '',
  'params[beginTime]': '',
  'params[endTime]': '',
};

export class TK87Crawler implements Crawler {
  private _crawlRegions = globalConfig.crawlRegions;
  private _pageSize = globalConfig.pageSize;
  private _pageNum = globalConfig.startPage;

  private _currentRegionIndex = 0;

  private _errorCount = 0;

  private async _getAnchorList(): Promise<{
    data: AnchorFrom87RawData[];
    end: boolean;
  }> {
    if (this._currentRegionIndex >= this._crawlRegions.length) {
      return { data: [], end: true };
    }
    const region = this._crawlRegions[this._currentRegionIndex];
    logger.info('[crawl region]', { region, page_num: this._pageNum });
    const data = {
      ...BASE_PARAMS,
      selectAreaIds: region,
      pageSize: this._pageSize.toString(),
      pageNum: this._pageNum.toString(),
      orderByColumn: 'account',
      isAsc: 'asc',
    };

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://tk.87cloud.cn/system/anchor/list',
      headers: HEADERS,
      data,
    };
    try {
      const response = await axios.request<{
        code: number;
        total: number;
        rows?: AnchorFrom87RawData[];
      }>(config);
      if (response.data.code === 0) {
        logger.info('[data crawled]', {
          page_num: this._pageNum,
          rows: response.data.rows?.length,
          total: response.data.total,
        });
        logger.trace(response.data.rows);
        let end = false;
        if (
          response.data.rows?.length === 0 ||
          this._pageNum * this._pageSize > response.data.total
        ) {
          this._currentRegionIndex++;
          this._pageNum = globalConfig.startPage;
          if (this._currentRegionIndex >= this._crawlRegions.length) {
            end = true;
          }
        }
        return {
          data: response.data.rows ?? [],
          end,
        };
      }
      logger.error('[data crawled error]', {
        page_num: this._pageNum,
        error: response.data,
      });
      return { data: response.data.rows ?? [], end: false };
    } catch (error) {
      this._errorCount++;
      logger.error('[data crawled error]', {
        page_num: this._pageNum,
        error,
      });
      return {
        data: [],
        end: false,
      };
    }
  }

  async run(): Promise<{
    success: boolean;
    end: boolean;
  }> {
    logger.info('TK87Crawler is running');
    const { data, end } = await this._getAnchorList();
    if (end) {
      return { success: true, end: true };
    }
    if (!data?.length) {
      if (this._errorCount > 20) {
        logger.error('TK87Crawler is running error', this._errorCount);
        return { success: false, end: true };
      }
      return { success: false, end: false };
    }
    this._errorCount = 0;
    await updateAnchor(
      data.map(item => {
        const anchor: UpdateAnchorData = {
          user_id: item.account_id,
          display_id: item.account,
          room_id: '0',
          region: item.country_code as Region,
          follower_count: item.follower_count,
          audience_count: item.live_room_count,
          level: 0,
          current_diamonds: item.day_diamond_val,
          rank_league: item.pieces as AnchorRankLeague | null,
          has_commerce_goods: Boolean(
            item.tag_title &&
              ['Shopping', '购物', '美容与时尚'].includes(item.tag_title),
          ),
          tag: item.tag_title,
          last_diamonds: item.last_day_diamond_val || null,
          highest_diamonds: item.his_max_diamond_val,
          created_at: item.create_time,
          updated_at: item.update_time ?? item.create_time,
          third_party_id: ThirdPartyId.TK87,
        };
        return anchor;
      }),
    );
    this._pageNum++;

    return { success: true, end: false };
  }
}
