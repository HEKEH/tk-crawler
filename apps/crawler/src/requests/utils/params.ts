import type { ChannelId } from '../constants';
import { randomBytes } from 'node:crypto';
import xbogus from 'xbogus';
import { getRandomArrayElement } from '../../utils';
import { CHANNEL_IDS, USER_AGENT } from '../constants';

export function getXBogus(url: string, userAgent: string = USER_AGENT) {
  const res = xbogus(url, userAgent);
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
  return getRandomArrayElement<ChannelId>(CHANNEL_IDS);
}

export function getChannelParamsByChannelId(channelId: ChannelId) {
  switch (channelId) {
    case 1111006:
      return {
        channel_id: channelId,
        // TODO
        related_live_tag: 'Garena Free Fire',
        req_from: 'pc_web_game_sub_feed_refresh',
      };
    case 1222001:
      return {
        channel_id: channelId,
        req_from: 'webapp_taxonomy_drawer_enter_feed',
      };
    case 86:
      return {
        channel_id: channelId,
        content_type: '0',
        req_from: 'pc_web_suggested_host',
      };
    case 87:
      return {
        channel_id: channelId,
        enter_from: 'live_mt_pc_web_rec_tab_refresh',
      };
  }
}
