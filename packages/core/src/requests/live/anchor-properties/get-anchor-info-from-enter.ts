import type { NumberString } from '@tk-crawler/shared';
import type { WithRegion } from '../../../types';
import type { TikTokQueryTokens } from '../types';
import { commonPostRequest } from '../../utils/common-request';
import { getUrl } from '../../utils/get-url';
import { getXBogus } from '../../utils/params';
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

const Temp_Cookie =
  'tt_csrf_token=rIVfXD0b-Z2NRtwhpqIsu41EdwDwZuvjfeaM; tt_chain_token=OKDmmlnPxp31hNukKy5NRw==; passport_csrf_token=54adee964987c315a6007dd41669f9f9; passport_csrf_token_default=54adee964987c315a6007dd41669f9f9; s_v_web_id=verify_m52hrc4l_v9BjnSlX_ktqz_47El_9BFS_HM7tZdDsReIb; _ga=GA1.1.74205259.1735046489; FPID=FPID2.2.jFNBr0YlmfhRbKfPsim1pJJdbBcnhoUaztc3AqqJ5UM%3D.1735046489; FPAU=1.2.1371985790.1735046489; csrfToken=qYlITCdN-By_oK8eCLyPdibdsqkyQ8J6oF4k; csrf_session_id=a52d0e38feb176f744ecbba8a425a005; _tt_enable_cookie=1; _fbp=fb.1.1736255175612.2064404046; tiktok_webapp_lang=zh-Hans; _ttp=2rqaAWvf61W3sdK4dU4SkfsymlG.tt.1; _ga_GZB380RXJX=GS1.1.1737599572.50.0.1737600387.0.0.2146739490; d_ticket=d2e070ddb61037c2af8ffb39c5f6399ab1b58; FPLC=%2Ff1hjw8Djzf7WqsLV3VHXZRub0ZSC16upalrvsexzqmRKefzMt2dAX6ZZgPoFLH8UMa9nGuweOZHnHTbK2O%2FzAwtFqhHVtenmlswHNXaHmS%2FWRWbVbWU%2BVIMZu%2FaQA%3D%3D; ak_bmsc=BFBE9E8A4767D0427FAB27F2E494FF88~000000000000000000000000000000~YAAQVfrOF5zkM2+UAQAAlw+Bnhr6qiYBn3kSQ4nTFnxFSVgup8r05UkS73cC33cYAZ5MqM8E35yLtOWZNjDTDpKPBkRqrcG9iFSb/YqHGB6BjwNTO/yqitUd7b4mcnDQPvQcqkMtNTZtCW2GYftVm0AjXBdDLzjHscdl0WJYQUM78YhhkwPXBXScUemh6sj/Y8o+YE/rzjhfhIB7FYBwy4Bwy9lhaZx/kgpJ9rpyg8LQfohIRn2+v0IQ2HEILN5zS4DCgaeI0WEOLBk+u/GHaqbxMlZQZFb9lPzdd5rL3CHEdd7jq1UthEcqn0/C/N7OeIZ2vhtrFkSKU2dW4tuPFsLz1lhBy6bHK2+QfnIU3TaBqyk5/V73gizU2F7KR3rHEuEYdVHZ93phRA==; multi_sids=7451967190302032901%3Abd4e8b0eb4bc5f3bd8c24aee6026e2ba; cmpl_token=AgQQAPOqF-RO0rdUWgrv4108_QstT75K_5AhYNprKg; sid_guard=bd4e8b0eb4bc5f3bd8c24aee6026e2ba%7C1737828368%7C15552000%7CThu%2C+24-Jul-2025+18%3A06%3A08+GMT; uid_tt=ceb3515f7c23c3e31f7b268c3787f59190b667aa00f286429fb514f4a9499558; uid_tt_ss=ceb3515f7c23c3e31f7b268c3787f59190b667aa00f286429fb514f4a9499558; sid_tt=bd4e8b0eb4bc5f3bd8c24aee6026e2ba; sessionid=bd4e8b0eb4bc5f3bd8c24aee6026e2ba; sessionid_ss=bd4e8b0eb4bc5f3bd8c24aee6026e2ba; sid_ucp_v1=1.0.0-KDk1YjgzNmE1NzVmZGUzZDQ3Mzg2ZTNlNjk0YWFkZDRjMDM4NmRkOGMKGgiFiMa-1pWttWcQkNDUvAYYsws4AUDqB0gEEAMaBm1hbGl2YSIgYmQ0ZThiMGViNGJjNWYzYmQ4YzI0YWVlNjAyNmUyYmE; ssid_ucp_v1=1.0.0-KDk1YjgzNmE1NzVmZGUzZDQ3Mzg2ZTNlNjk0YWFkZDRjMDM4NmRkOGMKGgiFiMa-1pWttWcQkNDUvAYYsws4AUDqB0gEEAMaBm1hbGl2YSIgYmQ0ZThiMGViNGJjNWYzYmQ4YzI0YWVlNjAyNmUyYmE; store-idc=alisg; store-country-code=jp; store-country-code-src=uid; tt-target-idc=alisg; tt-target-idc-sign=aZ2cyWlfnqnr8MMBs1dzTIcZtB1F51ZLiAseJGG8s15FuKmnrTiEdcR2ykx6XgagU5ef9O-Y6DmWCp866gey7-L7cASCu6KkQyNKjKYNo6jXbGuahOoN4SzX-XGG3xU0iVtt6G2ZkZwh7-SwejUj7CAbYVg4Unz-WHCpkHx1WocGrcpjEiH3Gm7yMe5HbgWKabxuedBlutL_mGb3Yvoc_g3_b9lrsQPZzvFaUxCK7H7eUBt1n6jvuzKs4bXe1aQmIWte15bgL2QEAnzDVt88_j4TjjkVs5xxNXFubjDVNYujI6A5ts4Rj1_MAeC1wjuqiTIT6cOpPcH6QP0i9_POvZRwAl5DY83pRoYX7cpgcKGnwgTp2tFj_dRl8zrS9yLgvICJJU7WZUED5q9tZV4xdnn1Iz9awWvxXzJ33aS-v7MC7P_mnNPJvWaqW47EvVs_G1GdiWAzlBHX7Pt_7Eu4-5gYKBcRzhiAYStIbQvCel25i6MvC-Q_tiTWYNj7SPxi; bm_sv=86211AD44904F9ECE0ABABFFF9D672AE~YAAQPi3RF4NVwpWUAQAADpCknhoSk+qt+Vdho8gfifwEYADHgu2tbZHkQ4gHM+aMIOG5R/791czVL3HsfhRMWHm3g0K0wZuP1dkv0q2vQ5n9z/sADpvVA8Vow+svRsOeYbbhTmQuouzrDBIyhMbqHen6t+hWdNLR3QFcsu0wsuZopyslJiOfKYv2bzHYME2cIqIwIVEso2Um1L2MG4dWb655VVqKpGtR8mZ2zzFCC9KleoN21K9SoKR+UjdOAUjvZA==~1; _ga_LWWPCY99PB=GS1.1.1737814806.34.1.1737828372.0.0.1030350633; ttwid=1%7COTe74t2gzOYPJZub12kjBn7xcNFbGBBQbyx_GbPghUw%7C1737828374%7Cdbd9768602127c092ab3c6836e25e78a81dc85788629d5ef3b9471a3d5ceddc7; odin_tt=aa9a96ff38d9ffbf47b081a8d0e2e4d9c6dc463d5fa7e46806638240f2314538e8049a44c17d0e4ad5437560a8ba81b03ad7e5edcf91379e8385c69f0486508fdb6340816d7db30a0eab0afa289c5240; msToken=xNvfVgw0zIQLUqOjEUCwJ1u7g_BPM4UASeRTvtdt_PVGrKeaet1bmMJMIV7p4Yxj_uKS6zD15ffdtKlztDAOSbi-TC3rtu_DR7SnattQO4naraR7T7nKciLNL61Rx0kfPxZCXNzN0gJiYGk95PPXmYLVxQ-6; msToken=dS8HgKTDojCWQd60bj9HsDy-iOvxgip8bSIFywGZHZzvsRuHmhLUoHDgppkJ7wt0Aob_MTEmzE5yBuD79jrEyAvFm95s9iopYuccHKt6JjJaJFNhBkPDMyPz-cyIZsN9aimkAEbLLfgqeNR0JsB9iWoz5Hl8; odin_tt=3b402566667dccff47ff5a715575406e82bc02d7e7890cfac575cdf44f8f186d744d659cc8f57403bc335d28e08344189143ba0f7206ac037f510fbc8b19c25c8dfea768634e53336251e3b25d6da3f6';

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
      ...COMMON_TIKTOK_QUERY,
      ...regionParams,
      ...tokens,
      user_is_login: 'true',
      msToken:
        'a1Vj8QHI9aO6B_ratZhPDgNDIFKE3SNrOEX9xwHJB6HfiFYmuPa5c6rkWJ3YkKvzFvAcsZUHVUoK99jJsL0AkD9_aIKHOx1EQJPSmyLG9WmcOLNg9p6HEaxGIPem44_Sisdht0mwdOW6yPVfJoMAF1nRg9iF',
    },
  });
  const body = `enter_source=recommend-suggested_others_photo&room_id=${roomId}`;
  const xBogus = getXBogus(url, body);
  console.log(xBogus, 'xBogus');
  const response = await commonPostRequest<LiveEnterResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    // url: `${url}`,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
      ...regionHeaders,
      cookie: Temp_Cookie,
    },
    body,
  });
  return response;
}
