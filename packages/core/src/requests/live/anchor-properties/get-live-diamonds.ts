import type { NumberString } from '@tk-crawler/shared';
import type { WithRegion } from '../../../types';
import type { TikTokQueryTokens } from '../types';
import { commonGetRequest } from '../../utils/common-request';
import { getUrl } from '../../utils/get-url';
import { getXBogusOldVersion } from '../../utils/params';
import {
  COMMON_TIKTOK_HEADERS,
  COMMON_TIKTOK_QUERY,
  getTiktokRegionParams,
  TIKTOK_WEBCAST_URL,
} from '../constants';

const TempCookie =
  'tt_csrf_token=rIVfXD0b-Z2NRtwhpqIsu41EdwDwZuvjfeaM; tt_chain_token=OKDmmlnPxp31hNukKy5NRw==; passport_csrf_token=54adee964987c315a6007dd41669f9f9; passport_csrf_token_default=54adee964987c315a6007dd41669f9f9; s_v_web_id=verify_m52hrc4l_v9BjnSlX_ktqz_47El_9BFS_HM7tZdDsReIb; _ga=GA1.1.74205259.1735046489; FPID=FPID2.2.jFNBr0YlmfhRbKfPsim1pJJdbBcnhoUaztc3AqqJ5UM%3D.1735046489; FPAU=1.2.1371985790.1735046489; csrfToken=qYlITCdN-By_oK8eCLyPdibdsqkyQ8J6oF4k; csrf_session_id=a52d0e38feb176f744ecbba8a425a005; _tt_enable_cookie=1; _fbp=fb.1.1736255175612.2064404046; tiktok_webapp_lang=zh-Hans; _ttp=2rqaAWvf61W3sdK4dU4SkfsymlG.tt.1; _ga_GZB380RXJX=GS1.1.1737599572.50.0.1737600387.0.0.2146739490; d_ticket=d2e070ddb61037c2af8ffb39c5f6399ab1b58; multi_sids=7451967190302032901%3A2fb89537dacef340b6c77fa75f862191; cmpl_token=AgQQAPOqF-RO0rdUWgrv4108_QstT75K_5AhYNp-rA; uid_tt=694cc7046d9a20c4c9d6bdb317f75940828a5bf31121def80c39460c9204cad0; uid_tt_ss=694cc7046d9a20c4c9d6bdb317f75940828a5bf31121def80c39460c9204cad0; sid_tt=2fb89537dacef340b6c77fa75f862191; sessionid=2fb89537dacef340b6c77fa75f862191; sessionid_ss=2fb89537dacef340b6c77fa75f862191; store-idc=alisg; store-country-code=jp; store-country-code-src=uid; tt-target-idc=alisg; tt-target-idc-sign=JGumUv8sS0-Vw24EndHW7CqL0EXiMxyi4MUIlM7Ple0hzhLc3N13VY9nFQn7p3CXMMztegUM3H6SUpcKyQmrMomIFdQ7MM6PrZiPEkHY0B5YLustylYjQ07g8feEI5NIomz-ZtH3Sju97YnD3_FEDBiHWvZMDA0qXLyQ8bbq3XG85Yej61YL1Wxa_3iYxLQVyS20QAadYi8iRVsP0mafA3TiyA4rv1gCZDtLgcxpVyaI2bgnp7xbxzYHPishiqN9gHhZtQmZ431xYA5PHDVRbIcTiGp8TC9lVEVslwC4__DYJsbGzTASviMtXzLv0rsj2nBNJ6xTSowqeWZ2KfGy5qQ9ncvfMCTBOF2Xlzm4zQKGJA4v1LFvh0t2nA0FdjyzLr_HQsOhb_v90ShXVchTX8IsRsEVrQ5Ehv6F4fe8V6Ewry_UXuwKPmc2ljYkl9poyMZhnY6R82P402R9spUjvdcvRKqH750CrZwkxS3i-ozTmqGYliMA8dASKIRm0L5j; ak_bmsc=4A374390A630207A122D8F37F1F98976~000000000000000000000000000000~YAAQPy3RFzwqopiUAQAAObphnBqOGMV5U8tOL+KJNhKTpoXKyIH87jwzP1OBNV/1MYANGnolYGk/Aff2nyl0ZXStugUBk8TR42dXyqf6/KqUs58LZlJhBvxGrUuqeoBTI8feOGjsPlKXkEH8DTzVV9xCmC78m2ENB7+tmZwCkFD2wjB/F6FOuEHOqUpQ9QGub4S6yC8k6zfPY1semJsZQGtKzeawfCSKYO87jfSNr6uHCkE0ZjsqHnIM4UC5og7eW1oUIJ10xsKznRPshyix5taUxtSGlWA0YoOJTMaxnsQCNU+ZMgPkKF8RUrK7/WwWvDhlrFdVXpna42X3iaKUIWLdnJvSdd6V/Rmkuu1EWyigi26q0DXI688CGtuc/VRoO/FkGbTbm23XeQ==; sid_guard=2fb89537dacef340b6c77fa75f862191%7C1737790445%7C15382222%7CTue%2C+22-Jul-2025+08%3A24%3A27+GMT; sid_ucp_v1=1.0.0-KDI0NmE4ZGUwNTU1NTkxNGYwODg5MGIxNDI3NWQyZDUwMThmNTdhMTkKGgiFiMa-1pWttWcQ7afSvAYYsws4AUDqB0gEEAMaAm15IiAyZmI4OTUzN2RhY2VmMzQwYjZjNzdmYTc1Zjg2MjE5MQ; ssid_ucp_v1=1.0.0-KDI0NmE4ZGUwNTU1NTkxNGYwODg5MGIxNDI3NWQyZDUwMThmNTdhMTkKGgiFiMa-1pWttWcQ7afSvAYYsws4AUDqB0gEEAMaAm15IiAyZmI4OTUzN2RhY2VmMzQwYjZjNzdmYTc1Zjg2MjE5MQ; FPLC=%2Ff1hjw8Djzf7WqsLV3VHXZRub0ZSC16upalrvsexzqmRKefzMt2dAX6ZZgPoFLH8UMa9nGuweOZHnHTbK2O%2FzAwtFqhHVtenmlswHNXaHmS%2FWRWbVbWU%2BVIMZu%2FaQA%3D%3D; bm_sv=00524C40A71CBF2723A019078BA55E50~YAAQNS3RF3iqNZmUAQAA5y6WnBrUPhJXCKNWXrL6+E5Flh+dvzFvqePgKJsXCH4VJKfaWK+/vO2pTQWJMFM5ynivzeiRRoL3EMkvVsJjrD+oy9H8sUdgWsu47TGIAxqzKI8pl24sxXpQZhQ3LmNZ+yqJrzJioS3y7gXDN2HJSpQq2wYKcuzbm0qvqyVtv5bSlgvsTrT+ClD3j06Q+C5mwxqdZn/iVf0W5XmICyXY8c5xJz/JAS/I8kuEVvyfEd8q~1; ttwid=1%7COTe74t2gzOYPJZub12kjBn7xcNFbGBBQbyx_GbPghUw%7C1737793877%7C2de126a80a5ee1c5568b1cb611e36486b597701ce85ab73016ab999235e69589; odin_tt=083730bcd4b9cf65d013ce15f5184d5ad101293353f2b3057c1e26f0c9a744507c4e3d9571e25c3ea52db8235cb548915814db3416b391d1ce2c432fe27d63c2b4a152021f21fb839e7dfb8fe6ee2927; _ga_LWWPCY99PB=GS1.1.1737793875.31.1.1737794292.0.0.1489903457; msToken=eJdz2vm-hDJd9EztOks_rqKxQncHs4H_tZmuP4sj_hMXba4HsuDEjImkznJEatWmBTanhnn7njHmxMe5_7-o4X3rAlj9uJV5bN3WmbyqlknTF-32AWxDANwvP2xrunASyuaofo0peNDDS8thaWljQUPeog==';

interface FanRank {
  rank: NumberString;
  score: NumberString;
}

export interface OnlineAudienceResponse {
  status_code: number;
  extra?: {
    now: number;
  };
  data?: {
    ranks: FanRank[];
  };
  message?: string;
}

export async function getLiveDiamonds({
  region,
  tokens,
  anchorId,
  roomId,
}: WithRegion<{
  tokens: TikTokQueryTokens;
  anchorId: string;
  roomId: string;
}>) {
  const { headers: regionHeaders, params: regionParams } =
    getTiktokRegionParams(region);
  const url = getUrl({
    baseUrl: TIKTOK_WEBCAST_URL,
    path: '/webcast/ranklist/online_audience/',
    params: {
      ...COMMON_TIKTOK_QUERY,
      user_is_login: 'true',
      ...regionParams,
      anchor_id: anchorId,
      room_id: roomId,
      ...tokens,
    },
  });
  const xBogus = getXBogusOldVersion(url);
  const response = await commonGetRequest<OnlineAudienceResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
      ...regionHeaders,
      cookie: TempCookie,
    },
  });
  if (response.status_code === 0) {
    const ranks = response.data?.ranks || [];
    const diamonds = ranks.reduce((acc, rank) => {
      acc += Number(rank.score || 0);
      return acc;
    }, 0);
    return {
      status_code: 0,
      data: diamonds,
    };
  }
  return response;
}
