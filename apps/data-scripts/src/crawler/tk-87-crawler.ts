import type { AnchorFrom87RawData } from '@tk-crawler/biz-shared';
import type { Crawler } from './types';
import axios from 'axios';
import { logger } from '../infra/logger';

const COOKIE =
  'rememberMe=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; JSESSIONID=5b7a336e-20bc-4466-b964-abcc664fb424';

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

const REGION = '英国';

const BASE_PARAMS = {
  account: '',
  tag_title: '',
  canuse_invitation_type: '',
  source: '',
  pieces: '',
  popup_invitation_type: '',
  share_status: '',
  guanzhu_status: 'all',
  selectAreaIds: REGION,
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
  pageSize: '200',
  pageNum: '1',
};

export class TK87Crawler implements Crawler {
  private _pageSize = 200;
  private _pageNum = 1;

  private _errorCount = 0;

  private async _getAnchorList(): Promise<AnchorFrom87RawData[]> {
    const data = {
      ...BASE_PARAMS,
      pageSize: this._pageSize.toString(),
      pageNum: this._pageNum.toString(),
    };

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://tk.87cloud.cn/system/anchor/list',
      headers: {
        ...COMMON_HEADERS,
        Cookie: COOKIE,
      },
      data,
    };
    try {
      const response = await axios.request(config);
      logger.info('[data crawled]', this._pageNum, response.data);
      return response.data;
    } catch (error) {
      this._errorCount++;
      logger.error('[data crawled error]', this._pageNum, error);
      return [];
    }
  }

  async run(): Promise<boolean> {
    logger.info('TK87Crawler is running');
    const data = await this._getAnchorList();
    if (!data?.length) {
      if (this._errorCount > 20) {
        return false;
      }
      return true;
    }
    this._pageNum++;

    // TODO: remove
    if (this._pageNum > 10) {
      return false;
    }
    return true;
  }
}
