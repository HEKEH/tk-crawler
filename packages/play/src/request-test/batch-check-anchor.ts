import {
  batchCheckAnchors,
  getFactionIdAndArea,
} from '@tk-crawler/tk-requests';
import logger from '../logger';

// const ESData = {
//   displayIds: ['tamara_bareta_directos', 'agua.cristalina1'],
//   cookie:
//     '_ga=GA1.1.441561010.1743859947; FPID=FPID2.2.VU7HeIhSc4iTtBq3tign7FK%2B43r22tuTshJXqngtPzU%3D.1743859947; FPAU=1.2.1637182263.1743859947; _fbp=fb.1.1743859947061.1847326178; _ttp=2vJOwL2LR0qSbg9mu0c1hNmQilb.tt.1; _tt_enable_cookie=1; id=22cea2d496fa000d||t=1743860601|et=730|cs=002213fd48dfbf5b15b4380de9; passport_csrf_token=c9d30625fef9558a6967f06cfe91a8fc; passport_csrf_token_default=c9d30625fef9558a6967f06cfe91a8fc; d_ticket_backstage=36a0bc960b2fffa4a83f9a173b1ae4a60e58b; store-country-sign=MEIEDIbb4OtR-Ke0QfixyAQgW08e0CCuRO8LwPw1kzP3Z2giKLlPuGMGirbNq1rcge8EEEFlApvoyqvbpV6mpZy9x8I; store-country-code=-; uid_tt_backstage=74e3a23ec13ad4414fb668fea8c0925c30cd770333280f3b1c995111d6123183; uid_tt_ss_backstage=74e3a23ec13ad4414fb668fea8c0925c30cd770333280f3b1c995111d6123183; sid_tt_backstage=fd5814b52f7f982a0ac1fdce763acb39; sessionid_backstage=fd5814b52f7f982a0ac1fdce763acb39; sessionid_ss_backstage=fd5814b52f7f982a0ac1fdce763acb39; sid_guard_backstage=fd5814b52f7f982a0ac1fdce763acb39%7C1743867983%7C5183997%7CWed%2C+04-Jun-2025+15%3A46%3A20+GMT; sid_ucp_v1_backstage=1.0.0-KDU1ODE1NmRhMzQ5OGViMWQwMGM2NTZlMTM0ODI3Njk2YTViN2IzOTIKGAiRiIK6g7rxu2cQz6DFvwYYwTU4AUDrBxADGgNzZzEiIGZkNTgxNGI1MmY3Zjk4MmEwYWMxZmRjZTc2M2FjYjM5; ssid_ucp_v1_backstage=1.0.0-KDU1ODE1NmRhMzQ5OGViMWQwMGM2NTZlMTM0ODI3Njk2YTViN2IzOTIKGAiRiIK6g7rxu2cQz6DFvwYYwTU4AUDrBxADGgNzZzEiIGZkNTgxNGI1MmY3Zjk4MmEwYWMxZmRjZTc2M2FjYjM5; passport_fe_beating_status=true; s_v_web_id=verify_m9gihlc2_8gbppzcr_A5rj_4Ino_A9gv_lQTz3CDABUmi; csrf_session_id=b1c1b602e6f7a5c11c16013e0866703a; ttwid=1%7CuIkYKFkCWtjekEiOfKSDxHXh9ACiq61kZQytTeX06tY%7C1744601168%7Cd1ccc5fd6f1945a26a671dd8e8707fb27e481dfe551d5e3002460d17ff1d9272; _ga_GZB380RXJX=GS1.1.1744601169.5.0.1744601169.0.0.950163197; FPLC=MEI6HSYLwMCe6kJjjGSKSWrAkmC8nxnM7ycUWj2lyFfcFmr5tPfZ2NCm9YO4zx3oDOYnBKZUEu%2BAx6o91Hb0HRG%2FM%2By8Qh4YNCyXYMn4EqARC0WGjwpZP5axbBjaOQ%3D%3D; ttcsid=1744601171057.1.1744601171057; ttcsid_CQ6FR3RC77U6L0AM21H0=1744601171057.1.1744601171489; msToken=xKEFwypP6-8kKzRKhEiQXb71V3OqLh0lNHaBIPxDT4cPOXNF1h7p8ZEYMyFiXRPg5Tk__tZPHpSGAF1rZbdWV9U-EIPQmU56I2BqIgxQWzv-a2DL_v4vc7A99pMq0wGp5uB2ziZN; msToken=xKEFwypP6-8kKzRKhEiQXb71V3OqLh0lNHaBIPxDT4cPOXNF1h7p8ZEYMyFiXRPg5Tk__tZPHpSGAF1rZbdWV9U-EIPQmU56I2BqIgxQWzv-a2DL_v4vc7A99pMq0wGp5uB2ziZN',
// };

const GBData = {
  displayIds: [
    'kickofffupdates',
    'mitchaustin10',
    'mintyaxelive',
    'paul_mcnally_',
  ],
  cookie:
    '_ga=GA1.1.1584351295.1743950828; passport_csrf_token=302689afcde636a25938f023c0008030; passport_csrf_token_default=302689afcde636a25938f023c0008030; d_ticket_backstage=8eaf5968ab10ac80a9031fdbc773e7a3239be; uid_tt_backstage=09fc7a7757d1d79aa7b50d6733b7bae8205202907b5b68abc416b6dff3c72be1; uid_tt_ss_backstage=09fc7a7757d1d79aa7b50d6733b7bae8205202907b5b68abc416b6dff3c72be1; sid_tt_backstage=2e241cc04dacddb00d4ef91c30773453; sessionid_backstage=2e241cc04dacddb00d4ef91c30773453; sessionid_ss_backstage=2e241cc04dacddb00d4ef91c30773453; FPID=FPID2.2.ajJ6jZLMWoH9uAgcWlZKzDIoY%2BtfA74XJHCKtj%2BYocE%3D.1743950828; FPAU=1.2.1513914182.1743950828; _fbp=fb.1.1743950827888.1529532140; _ttp=2vMN8wpRfHtfEQqXXqQ08i7edMF.tt.1; _tt_enable_cookie=1; sid_guard_backstage=2e241cc04dacddb00d4ef91c30773453%7C1743950830%7C5183997%7CThu%2C+05-Jun-2025+14%3A47%3A07+GMT; sid_ucp_v1_backstage=1.0.0-KGZhZTc0MTY1OTRmNzMwOTAxMWY0YmEzNzJhNjc3MzI4N2QwYzM5ZGIKGAiUiI-WrZTcrGcQ7qfKvwYYwTU4AUDrBxADGgNzZzEiIDJlMjQxY2MwNGRhY2RkYjAwZDRlZjkxYzMwNzczNDUz; ssid_ucp_v1_backstage=1.0.0-KGZhZTc0MTY1OTRmNzMwOTAxMWY0YmEzNzJhNjc3MzI4N2QwYzM5ZGIKGAiUiI-WrZTcrGcQ7qfKvwYYwTU4AUDrBxADGgNzZzEiIDJlMjQxY2MwNGRhY2RkYjAwZDRlZjkxYzMwNzczNDUz; id=2266fcd298fa007e||t=1743950836|et=730|cs=002213fd4895814826150f1899; FPLC=BNmq%2B4U16%2B%2BFcIO1VGjJuyjZGRtbgEI3NxFFRCKfAiZ0nzzs6W5uWhfgyPAVb5ixU0wqr7rV6a1bUKXeo%2FDijbGPoOv9OH4hqzPGBN%2FJ3YkoLIQaqHT5FN12pLQtUg%3D%3D; passport_fe_beating_status=true; s_v_web_id=verify_m9h3o1pn_4qOlvvLE_T4nC_4sMR_BXCy_4oMqOYqfDl2W; ttwid=1%7C3W5dd7xmQrgInaWiz0rKcNVEDXTjP1HvG_LvyyW3oPo%7C1744636737%7Ce48cc7b6d0e184ed87ccfd4e333f8e528bb526a461d89d96b679cbc3d3739dd2; csrf_session_id=b1c1b602e6f7a5c11c16013e0866703a; _ga_GZB380RXJX=GS1.1.1744635599.2.1.1744636738.0.0.1192833849; ttcsid=1744635600202.1.1744636739274; ttcsid_CQ6FR3RC77U6L0AM21H0=1744635600202.1.1744636739620; msToken=DdeJUK1VUI5XjvBJKKDfUKkT5tkXC5DOYuCmicx1aqLOPGhb7JfKVNZD7X6vHHgG61EUf_CBs5KBQHuLBvTmtCbplc5zZeQWff5XJmQAOLM7SnIz9w_giHMOTl6YmZGG5sd6-Og=; msToken=DdeJUK1VUI5XjvBJKKDfUKkT5tkXC5DOYuCmicx1aqLOPGhb7JfKVNZD7X6vHHgG61EUf_CBs5KBQHuLBvTmtCbplc5zZeQWff5XJmQAOLM7SnIz9w_giHMOTl6YmZGG5sd6-Og=',
};

export default async function batchCheckAnchorTest() {
  const data = GBData;
  const { factionId } = (await getFactionIdAndArea(data.cookie, logger)) || {};
  if (!factionId) {
    throw new Error('Faction id get failed');
  }
  const res = await batchCheckAnchors({
    ...data,
    factionId,
  });
  console.log(JSON.stringify(res, null, 2), 'batchCheckAnchor');
  return res;
}
