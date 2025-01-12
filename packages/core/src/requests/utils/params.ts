import { randomBytes } from 'node:crypto';
import webmssdk from 'tk-crack/webmssdk';
import xBogus from 'xbogus';
import {
  getRandomArrayElement,
  getRandomArrayElementWithWeight,
} from '../../utils';
import { USER_AGENT } from '../constants';
import { ChannelId } from '../live/constants';

export function getXBogusOldVersion(
  url: string,
  userAgent = USER_AGENT,
): string {
  const res = xBogus(url, userAgent);
  return res;
}

let webmssdkInitiated = false;

function initWebmssdk() {
  if (webmssdkInitiated) {
    return;
  }
  webmssdkInitiated = true;
  webmssdk.init({
    aid: 1,
    isSDK: false,
    boe: false,
    enablePathList: [],
    region: 'sg-tiktok',
    mode: 513,
  });
}

/** 在Live管理中使用 */
export function getXBogusNewVersion(
  url: string,
  body?: string | Record<string, any>,
): string {
  initWebmssdk();
  let _body;
  if (body) {
    _body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = webmssdk.getXBogus(url, _body);
  return res;
}

const MESSAGE_TOKEN_CHARS =
  'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789-_';
export function getMessageToken() {
  const randomValues = randomBytes(155);
  const result = Array.from(
    randomValues,
    value => MESSAGE_TOKEN_CHARS[value % MESSAGE_TOKEN_CHARS.length],
  ).join('');
  return `${result}=`;
}

const VERIFY_FP_CHARS =
  'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789_';
export function getVerifyFp() {
  const randomValues = randomBytes(45);
  const result = Array.from(
    randomValues,
    value => VERIFY_FP_CHARS[value % VERIFY_FP_CHARS.length],
  ).join('');
  return `verify_${result}`;
}

export function getRandomChannelId() {
  // 自定义权重，目前游戏主播比较多，因此权重较大
  return getRandomArrayElementWithWeight<ChannelId>([
    [ChannelId.GAMING_WITH_TAG, 8],
    [ChannelId.LIFESTYLE_WITH_TAG, 2],
    [ChannelId.SUGGESTED, 1],
    [ChannelId.RECOMMEND, 1],
    [ChannelId.GAMING, 1],
  ]);
}

export interface ChannelParams {
  channel_id: ChannelId;
  req_from: string;
  content_type?: string;
  related_live_tag?: string;
}

export type ChannelSubTagMap = {
  [key in ChannelId]?: {
    tag: string;
    weight: number;
  }[];
};

export function getChannelParamsByChannelId(
  channelId: ChannelId,
  channelSubTagMap: ChannelSubTagMap,
): ChannelParams {
  const getSubTag = (channelId: ChannelId) => {
    const subTags = channelSubTagMap[channelId];
    if (!subTags?.length) {
      return undefined;
    }
    return getRandomArrayElementWithWeight(
      subTags.map(tag => [tag.tag, tag.weight]),
    );
  };
  switch (channelId) {
    // 根据游戏tag获得游戏直播列表
    case ChannelId.GAMING_WITH_TAG:
      return {
        channel_id: channelId,
        related_live_tag: getSubTag(channelId),
        req_from: 'pc_web_game_sub_feed_refresh',
      };
    // 生活方式
    case ChannelId.LIFESTYLE_WITH_TAG:
      return {
        channel_id: channelId,
        related_live_tag: getSubTag(channelId),
        req_from: 'webapp_taxonomy_drawer_enter_feed',
      };
    // 推荐1
    case ChannelId.SUGGESTED:
      return {
        channel_id: channelId,
        content_type: '0',
        req_from: 'pc_web_suggested_host',
        related_live_tag: getSubTag(channelId),
      };

    // 推荐2
    case ChannelId.RECOMMEND:
      return {
        channel_id: channelId,
        req_from: getRandomArrayElement([
          'live_mt_pc_web_rec_tab_refresh',
          'pc_web_game_feed_loadmore',
        ]),
        related_live_tag: getSubTag(channelId),
      };
    // 游戏
    case ChannelId.GAMING:
      return {
        channel_id: channelId,
        req_from: 'pc_web_game_feed_refresh',
        related_live_tag: getSubTag(channelId),
      };
  }
}
