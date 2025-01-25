import type { NumberString } from '@tk-crawler/shared';
import type { WithRegion } from '../../../types';
import type { TikTokQueryTokens } from '../types';
import { commonPostRequest } from '../../utils/common-request';
import { getUrl } from '../../utils/get-url';
import { getXBogusNewVersion, getXBogusOldVersion } from '../../utils/params';
import {
  COMMON_TIKTOK_HEADERS,
  COMMON_TIKTOK_QUERY,
  getTiktokRegionParams,
  TIKTOK_WEBCAST_URL,
} from '../constants';

interface FanRank {
  rank: NumberString;
  score: NumberString;
}

const TEMP_COOKIE =
  'tt_csrf_token=rIVfXD0b-Z2NRtwhpqIsu41EdwDwZuvjfeaM; tt_chain_token=OKDmmlnPxp31hNukKy5NRw==; passport_csrf_token=54adee964987c315a6007dd41669f9f9; passport_csrf_token_default=54adee964987c315a6007dd41669f9f9; s_v_web_id=verify_m52hrc4l_v9BjnSlX_ktqz_47El_9BFS_HM7tZdDsReIb; _ga=GA1.1.74205259.1735046489; FPID=FPID2.2.jFNBr0YlmfhRbKfPsim1pJJdbBcnhoUaztc3AqqJ5UM%3D.1735046489; FPAU=1.2.1371985790.1735046489; csrfToken=qYlITCdN-By_oK8eCLyPdibdsqkyQ8J6oF4k; csrf_session_id=a52d0e38feb176f744ecbba8a425a005; _tt_enable_cookie=1; _fbp=fb.1.1736255175612.2064404046; tiktok_webapp_lang=zh-Hans; _ttp=2rqaAWvf61W3sdK4dU4SkfsymlG.tt.1; _ga_GZB380RXJX=GS1.1.1737599572.50.0.1737600387.0.0.2146739490; d_ticket=d2e070ddb61037c2af8ffb39c5f6399ab1b58; FPLC=%2Ff1hjw8Djzf7WqsLV3VHXZRub0ZSC16upalrvsexzqmRKefzMt2dAX6ZZgPoFLH8UMa9nGuweOZHnHTbK2O%2FzAwtFqhHVtenmlswHNXaHmS%2FWRWbVbWU%2BVIMZu%2FaQA%3D%3D; ak_bmsc=10400BCC3EB0BF2E22279BE2531062FC~000000000000000000000000000000~YAAQDS3RFx4nKpuUAQAAsf+hnRppaAk9dLdicQIgU2x3QdWLwqGWmWbHZZ2FnvzUdG1n1RLy4/DUfM6FjZaz5KAbQK18749AQ/K9LahXOuPXBV5i5BYMnLE7YxMNLYinR3Zu6bvl47pP/agQpj2EihNCpxVppFijBw1RRKIERfwR06VReTcHH3vK0oM/tbtrakprQSclUrk/5exVaoqxQnf1T/X5hIwjeYJifExo1FesxCN4qYKffB20g4RSQB3FssdUwiLz7+eL86+aLB2r0J9J93Of8BcM8z7/RtLb8xrAk/2II0ufLXDVAVQD68Pwk0FpJISiYOCmAGUA/BLaQgP6cVsDDODw3tNEUogRGy6T9yfUaAYTFsX0jwO/QXu97lgCEqOP0hQYkA==; sid_guard=0bf8669287899235d259d0c069c12ca9%7C1737811506%7C21600%7CSat%2C+25-Jan-2025+19%3A25%3A06+GMT; uid_tt=196d6bcdcec8475fabe8744cac8edef9; uid_tt_ss=196d6bcdcec8475fabe8744cac8edef9; sid_tt=0bf8669287899235d259d0c069c12ca9; sessionid=0bf8669287899235d259d0c069c12ca9; sessionid_ss=0bf8669287899235d259d0c069c12ca9; sid_ucp_v1=1.0.0-KDY2YzA5NzJmOGVmYjQxYTYwNWE3ZDI4MDQ0ZTYyYzJkN2RhNmJkZmMKCRCyzNO8BhizCxADGgNteTIiIDBiZjg2NjkyODc4OTkyMzVkMjU5ZDBjMDY5YzEyY2E5; ssid_ucp_v1=1.0.0-KDY2YzA5NzJmOGVmYjQxYTYwNWE3ZDI4MDQ0ZTYyYzJkN2RhNmJkZmMKCRCyzNO8BhizCxADGgNteTIiIDBiZjg2NjkyODc4OTkyMzVkMjU5ZDBjMDY5YzEyY2E5; odin_tt=65f70b0c8c3720ab29e0263c3464fd7cfb0a5e16836cbf912882d5151b7e4911b1a7759caa2bb5cd806909a97b8f22a779f0a135f064bbeca3ca719e26097dac52412a634b1a56ec77b8d36a3e3e98cd; bm_sv=C46AC3CB783C6BD581A31261F9B26BB4~YAAQNC3RF/hyYpOUAQAAstujnRqk2TEyNZ0yBZFv4yVcB8hAwBlqT/5leIvMrW7CzQLIHg8xvmkZiFVbEAHX4r3OWWQGUjDeenfn1g0s64zsKkBTPHBxgSRyesygQiYR2t9eBU20TAOXMXIVT70y+sDPidpfjeXeeGIn4fEr1htpQABcOPzmIrxd0tobwiL5VeHJk2n79yN+cFgKvLInxqhD3MbJxM6hUShX3RoyqZ7HYd7xV01PXsXcOn76dIGd~1; _ga_LWWPCY99PB=GS1.1.1737811417.33.1.1737811549.0.0.494041654; ttwid=1%7COTe74t2gzOYPJZub12kjBn7xcNFbGBBQbyx_GbPghUw%7C1737811551%7C6414d46bede2a5a819cb353677a4d9699dc0818593b75ac24b3a33bb5daa75b0; msToken=TTRvhiC3QRLQES14C-BT_VfjfCxKQYJ4cVeC5CBt4FplnO1VrUBVLdHRafC-cDpmuPZsi4rvNOppqwBfnxZRRj1O2mVVxtB_4CWb76k6AqlabEBYkWJ_ojwV6c-FPdgrSvyIy5UXUS6TkmYkorBwNzKX1tsR';

export interface LiveEnterResponse {
  status_code: number;
  extra?: {
    now: number;
  };
  data?: {
    ranks: FanRank[];
  };
  message?: string;
}

export async function getAnchorInfoFromEnter({
  region,
  tokens,
  roomId,
}: WithRegion<{
  tokens: TikTokQueryTokens;
  roomId: string;
}>) {
  const { headers: regionHeaders, params: regionParams } =
    getTiktokRegionParams(region);
  const url = getUrl({
    baseUrl: TIKTOK_WEBCAST_URL,
    path: '/webcast/room/enter/',
    params: {
      // ...COMMON_TIKTOK_QUERY,
      // ...regionParams,
      // ...tokens,
      aid: '1988',
      app_language: 'zh-Hans',
      app_name: 'tiktok_web',
      browser_language: 'zh-TW',
      browser_name: 'Mozilla',
      browser_online: 'true',
      browser_platform: 'MacIntel',
      browser_version:
        '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      channel: 'tiktok_web',
      cookie_enabled: 'true',
      data_collection_enabled: 'true',
      device_id: '7451966978406073874',
      device_platform: 'web_pc',
      device_type: 'web_h265',
      focus_state: 'false',
      from_page: 'user',
      history_len: '18',
      is_fullscreen: 'true',
      is_page_visible: 'false',
      os: 'mac',
      priority_region: '',
      referer: '',
      region: 'JP',
      root_referer: 'https://www.google.com/',
      screen_height: '1440',
      screen_width: '2560',
      tz_name: 'Asia/Shanghai',
      user_is_login: 'false',
      verifyFp: 'verify_m52hrc4l_v9BjnSlX_ktqz_47El_9BFS_HM7tZdDsReIb',
      webcast_language: 'zh-Hans',
      msToken:
        'TTRvhiC3QRLQES14C-BT_VfjfCxKQYJ4cVeC5CBt4FplnO1VrUBVLdHRafC-cDpmuPZsi4rvNOppqwBfnxZRRj1O2mVVxtB_4CWb76k6AqlabEBYkWJ_ojwV6c-FPdgrSvyIy5UXUS6TkmYkorBwNzKX1tsR',
      'X-Bogus': 'DFSzswVOyC-Vl9WktdD7pfLNKBTp',
    },
  });
  const body = `enter_source=live_merge-live_cover&room_id=${roomId}`;
  const xBogus = getXBogusOldVersion(url, body);
  console.log(xBogus, 'xBogus');
  const response = await commonPostRequest<LiveEnterResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    // url,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
      ...regionHeaders,
    },
    body: `enter_source=live_merge-live_cover&room_id=${roomId}`,
  });
  return response;
}
