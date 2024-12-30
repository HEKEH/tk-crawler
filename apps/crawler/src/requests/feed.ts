/* eslint-disable unused-imports/no-unused-vars */
import type { WithLng } from '../types';
import { DEFAULT_LANGUAGE } from '../constants';
import {
  COMMON_TIKTOK_HEADERS,
  // COMMON_TIKTOK_QUERY,
  // TIKTOK_LANGUAGE_MAP,
  // TIKTOK_WEBCAST_URL,
} from './constants';
import { commonGetRequest } from './utils/common-request';

// eslint-disable-next-line ts/no-empty-object-type
export default async function getFeed({ lng = DEFAULT_LANGUAGE }: WithLng<{}>) {
  return commonGetRequest<any>({
    url: 'https://webcast.tiktok.com/webcast/feed/?aid=1988&app_language=zh-Hans&app_name=tiktok_web&browser_language=zh-CN&browser_name=Mozilla&browser_online=true&browser_platform=MacIntel&browser_version=5.0%20%28Macintosh%3B%20Intel%20Mac%20OS%20X%2010_15_7%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F131.0.0.0%20Safari%2F537.36&channel=tiktok_web&channel_id=86&content_type=0&cookie_enabled=true&data_collection_enabled=false&device_id=7451966978406073874&device_platform=web_pc&device_type=web_h265&focus_state=false&from_page=user&hidden_banner=true&history_len=5&is_fullscreen=true&is_non_personalized=0&is_page_visible=true&max_time=0&os=mac&priority_region=&referer=&region=SG&req_from=pc_web_suggested_host&screen_height=1440&screen_width=2560&tz_name=Asia%2FShanghai&user_is_login=false&verifyFp=verify_m52hrc4l_v9BjnSlX_ktqz_47El_9BFS_HM7tZdDsReIb&webcast_language=zh-Hans&msToken=5nvgRQCYlQ6s8qmbEhD-PcvLtob_mVyG38acSp9LyBd2I3uU6-lNbANNUhqiihx1eWbZlrzTlvNdy05SdxlBRQpSxZQVlZAoMQTBk34GtLarj-JJj2oYbUuaCr_LlDRbO5vlbRcdOy7tqu29BzihJPI=&X-Bogus=DFSzKwVu9-bANyXlt0PL8jLNKBYS',
    headers: {
      ...COMMON_TIKTOK_HEADERS,
    },
  });
}
