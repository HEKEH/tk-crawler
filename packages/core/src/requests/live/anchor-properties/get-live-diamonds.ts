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
  'tt_csrf_token=rIVfXD0b-Z2NRtwhpqIsu41EdwDwZuvjfeaM; tt_chain_token=OKDmmlnPxp31hNukKy5NRw==; passport_csrf_token=54adee964987c315a6007dd41669f9f9; passport_csrf_token_default=54adee964987c315a6007dd41669f9f9; s_v_web_id=verify_m52hrc4l_v9BjnSlX_ktqz_47El_9BFS_HM7tZdDsReIb; _ga=GA1.1.74205259.1735046489; FPID=FPID2.2.jFNBr0YlmfhRbKfPsim1pJJdbBcnhoUaztc3AqqJ5UM%3D.1735046489; FPAU=1.2.1371985790.1735046489; csrfToken=qYlITCdN-By_oK8eCLyPdibdsqkyQ8J6oF4k; csrf_session_id=a52d0e38feb176f744ecbba8a425a005; _tt_enable_cookie=1; _fbp=fb.1.1736255175612.2064404046; tiktok_webapp_lang=zh-Hans; _ttp=2rqaAWvf61W3sdK4dU4SkfsymlG.tt.1; _ga_GZB380RXJX=GS1.1.1737599572.50.0.1737600387.0.0.2146739490; d_ticket=d2e070ddb61037c2af8ffb39c5f6399ab1b58; FPLC=%2Ff1hjw8Djzf7WqsLV3VHXZRub0ZSC16upalrvsexzqmRKefzMt2dAX6ZZgPoFLH8UMa9nGuweOZHnHTbK2O%2FzAwtFqhHVtenmlswHNXaHmS%2FWRWbVbWU%2BVIMZu%2FaQA%3D%3D; ak_bmsc=10400BCC3EB0BF2E22279BE2531062FC~000000000000000000000000000000~YAAQDS3RFx4nKpuUAQAAsf+hnRppaAk9dLdicQIgU2x3QdWLwqGWmWbHZZ2FnvzUdG1n1RLy4/DUfM6FjZaz5KAbQK18749AQ/K9LahXOuPXBV5i5BYMnLE7YxMNLYinR3Zu6bvl47pP/agQpj2EihNCpxVppFijBw1RRKIERfwR06VReTcHH3vK0oM/tbtrakprQSclUrk/5exVaoqxQnf1T/X5hIwjeYJifExo1FesxCN4qYKffB20g4RSQB3FssdUwiLz7+eL86+aLB2r0J9J93Of8BcM8z7/RtLb8xrAk/2II0ufLXDVAVQD68Pwk0FpJISiYOCmAGUA/BLaQgP6cVsDDODw3tNEUogRGy6T9yfUaAYTFsX0jwO/QXu97lgCEqOP0hQYkA==; multi_sids=7451967190302032901%3A76c459b3ad4a152ba7fd2a9eba65d638; cmpl_token=AgQQAPOqF-RO0rdUWgrv4108_QstT75K_5AhYNpr-Q; uid_tt=178c65b3b34f2dbb16b5f57c8731af39e325f84a7ffd58d00bb6352f037d42ca; uid_tt_ss=178c65b3b34f2dbb16b5f57c8731af39e325f84a7ffd58d00bb6352f037d42ca; sid_tt=76c459b3ad4a152ba7fd2a9eba65d638; sessionid=76c459b3ad4a152ba7fd2a9eba65d638; sessionid_ss=76c459b3ad4a152ba7fd2a9eba65d638; store-idc=alisg; store-country-code=jp; store-country-code-src=uid; tt-target-idc=alisg; tt-target-idc-sign=BC6yKF6vBThE9f0XpwItxh7Yhs5XHT2y2HCjLX3M3gmhxsX3L8KrdXCIfCaqFETT5O6N4YLOrdJEni-1Mrj7tIpNPdVW4QOdO5DJ9XUumZsWIUfcimDJYBAHzAZl8EITI9ys4taZPkcJsA2Zr_eyP29BD8X8EZxrsz8PhGyV5irXzZO81QgeglHRZRuOPsJhFsRmQP40lQ2O5h4ebT0i2DipMYLJ3XQ0-n_FBZY-DfOawhGZhbzh6_fxWqgCNR6diI2snZ2KR2bBYyqoq_49BJDMdx5cq2Lcwh4Wapm_jFr03LvMOHupb4PhGq_4KJWAt8omFipvQqMyTRpymfk8NiWhSImhb2g3aMvwmCj4V95dufRh0DK1rH56z5fKpgc7ngSs1AfOyoEOAqfuo8pdPMqaslf9GUS_CvVXStdZG-Teu0ZYUZ8sZWIbInYMF-BQein_P7gosT6SOqj_WcOydPFLXv8VykgXtHJYs_dYSMPg1HmAD6yi4WGp7Lxs7oNg; sid_guard=76c459b3ad4a152ba7fd2a9eba65d638%7C1737815828%7C15551995%7CThu%2C+24-Jul-2025+14%3A37%3A03+GMT; sid_ucp_v1=1.0.0-KDJlZTA5MTlmMDU0MGRjNWY2NmZjZWUwODEwZmI5NzY2OGU1M2FiOTkKGgiFiMa-1pWttWcQlO7TvAYYsws4AUDqB0gEEAMaAm15IiA3NmM0NTliM2FkNGExNTJiYTdmZDJhOWViYTY1ZDYzOA; ssid_ucp_v1=1.0.0-KDJlZTA5MTlmMDU0MGRjNWY2NmZjZWUwODEwZmI5NzY2OGU1M2FiOTkKGgiFiMa-1pWttWcQlO7TvAYYsws4AUDqB0gEEAMaAm15IiA3NmM0NTliM2FkNGExNTJiYTdmZDJhOWViYTY1ZDYzOA; bm_sv=C46AC3CB783C6BD581A31261F9B26BB4~YAAQNC3RF51bY5OUAQAAEIflnRrnvk+BquobgbOqRVCTPXOnpq97GuWxIS+Izcz7ls3uKBQiOfX4MfdVL8wda+yyl8vNOUHZ6ZWmoS7cOWl6JzVm9y1k/Wj7jfJ/kke0wkqemk+txGYLaRWW9W03X5mAqv4uRjejvgykB1H7kTgCRmthWpKzUsNoNVKDRbTZehlmWOAM4WUNudGRz1AeDDlWluCBvYSoWVoohHTQqTY2HhiHDA1kP1NCwODXtm40ug==~1; ttwid=1%7COTe74t2gzOYPJZub12kjBn7xcNFbGBBQbyx_GbPghUw%7C1737815855%7C5c68b61975bceec459142117193eb5df9c3fb907f327494903a916644eaaccb9; odin_tt=c88fe37fef9118e6274250b599a8fb69906fb49cb0fd81eae721068292ea90a37491865894e166f6ae56f90a0a3180b71b06696a6091ed1730d7787efd0c5c06be137925998481f197e46d52ac3670e1; _ga_LWWPCY99PB=GS1.1.1737814806.34.1.1737815875.0.0.1030350633; msToken=rOP_7X17YGtxunEyK-OkRKe_jMsOjGDCPY_E1TRjHGhn6kUnaWDorXo5UIj1WFWTqLofL-vXvj340YzNUdLgdjUyMPMPFGT_VWxZe_Vmb9VnxPyEvQv2fUsq1Hcafx0Avnurg-oUg4brqsl9vsBvik7fsQ==';

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
