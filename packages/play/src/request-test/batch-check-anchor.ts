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
    '_ga=GA1.1.891385632.1743924555; FPID=FPID2.2.SKIE2yGGt4uGkKdikPUBpFIXvaVgqa6Kx%2BXTD%2FQVTZI%3D.1743924555; FPAU=1.2.1587102476.1743924556; _fbp=fb.1.1743924555492.1871340777; _ttp=2vLVtUlrDNq9ztm9hIXZf2gLJqG.tt.1; _tt_enable_cookie=1; id=227bff4894fa00f8||t=1743924556|et=730|cs=002213fd482f760d191fc72206; passport_csrf_token=89b0dac631baacb38b7ef6089969829e; passport_csrf_token_default=89b0dac631baacb38b7ef6089969829e; d_ticket_backstage=384671d73230117095cc6412aa4382dc1f547; sid_guard_backstage=927aedb3cb80ee828ebbb33fd76566e0%7C1743924556%7C5184000%7CThu%2C+05-Jun-2025+07%3A29%3A16+GMT; uid_tt_backstage=5aa35cd0fdc5811e4f491fb7b4ded59cc2400da97ee5d3761fd36460c50ed6c8; uid_tt_ss_backstage=5aa35cd0fdc5811e4f491fb7b4ded59cc2400da97ee5d3761fd36460c50ed6c8; sid_tt_backstage=927aedb3cb80ee828ebbb33fd76566e0; sessionid_backstage=927aedb3cb80ee828ebbb33fd76566e0; sessionid_ss_backstage=927aedb3cb80ee828ebbb33fd76566e0; sid_ucp_v1_backstage=1.0.0-KDc1MDFmODc3ZTZjOTg5NjRjYzg3OTEwNTQwMzE0NjFhZjhjOTRmOWYKGAiIiJy-2oTVrmcQzNrIvwYYwTU4AUDrBxADGgNzZzEiIDkyN2FlZGIzY2I4MGVlODI4ZWJiYjMzZmQ3NjU2NmUw; ssid_ucp_v1_backstage=1.0.0-KDc1MDFmODc3ZTZjOTg5NjRjYzg3OTEwNTQwMzE0NjFhZjhjOTRmOWYKGAiIiJy-2oTVrmcQzNrIvwYYwTU4AUDrBxADGgNzZzEiIDkyN2FlZGIzY2I4MGVlODI4ZWJiYjMzZmQ3NjU2NmUw; FPLC=4IYqsoYaxLxR4RoislaE2siWHlIi13mGx31kQe6zzAAWh2E9XzgDSOQrmdJTGgHBydPevnJmmLMJ8cUM7zQMQHC6GHQd7Xda4s1RY6j4GLa89TCdF2JCKIu%2BzGJ5Rg%3D%3D; passport_fe_beating_status=true; ttwid=1%7C1s0nsOaZ2OgdPbiYdytfnnGl0MjcO2a1XOYTstin5TY%7C1744640997%7Cb94720b5cb5a93dff1d8d82a23c4d22332b24d261fa24b8d8b09a22463f9e61a; s_v_web_id=verify_m9h67cv2_mZOMtj4d_2KEu_4bQS_8iiV_ptdvWQfku1zW; csrf_session_id=b1c1b602e6f7a5c11c16013e0866703a; _ga_GZB380RXJX=GS1.1.1744641000.6.0.1744641000.0.0.1002627982; ttcsid=1744641000482.3.1744641000482; ttcsid_CQ6FR3RC77U6L0AM21H0=1744641000482.3.1744641001046; msToken=Bu4aEiM1nx2vAy8gA6h4zHTaI710X_iYMx3a126ne9X88QAl_6CqDEk4JFbVVjDIUVWar5RFKPaoBzRy9LCoEWL6DQWwS30m_kwAH_9kN-QX0eXdqa20ITbsSYV8boNPuyFgHXY=; msToken=Bu4aEiM1nx2vAy8gA6h4zHTaI710X_iYMx3a126ne9X88QAl_6CqDEk4JFbVVjDIUVWar5RFKPaoBzRy9LCoEWL6DQWwS30m_kwAH_9kN-QX0eXdqa20ITbsSYV8boNPuyFgHXY=',
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
