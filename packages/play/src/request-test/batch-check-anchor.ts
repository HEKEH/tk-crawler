import {
  batchCheckAnchors,
  getFactionIdAndArea,
} from '@tk-crawler/tk-requests';
import logger from '../logger';

const ESData = {
  displayIds: ['tamara_bareta_directos', 'agua.cristalina1'],
  cookie:
    '_ga=GA1.1.441561010.1743859947; FPID=FPID2.2.VU7HeIhSc4iTtBq3tign7FK%2B43r22tuTshJXqngtPzU%3D.1743859947; FPAU=1.2.1637182263.1743859947; _fbp=fb.1.1743859947061.1847326178; _ttp=2vJOwL2LR0qSbg9mu0c1hNmQilb.tt.1; _tt_enable_cookie=1; id=22cea2d496fa000d||t=1743860601|et=730|cs=002213fd48dfbf5b15b4380de9; passport_csrf_token=c9d30625fef9558a6967f06cfe91a8fc; passport_csrf_token_default=c9d30625fef9558a6967f06cfe91a8fc; d_ticket_backstage=36a0bc960b2fffa4a83f9a173b1ae4a60e58b; store-country-sign=MEIEDIbb4OtR-Ke0QfixyAQgW08e0CCuRO8LwPw1kzP3Z2giKLlPuGMGirbNq1rcge8EEEFlApvoyqvbpV6mpZy9x8I; store-country-code=-; uid_tt_backstage=74e3a23ec13ad4414fb668fea8c0925c30cd770333280f3b1c995111d6123183; uid_tt_ss_backstage=74e3a23ec13ad4414fb668fea8c0925c30cd770333280f3b1c995111d6123183; sid_tt_backstage=fd5814b52f7f982a0ac1fdce763acb39; sessionid_backstage=fd5814b52f7f982a0ac1fdce763acb39; sessionid_ss_backstage=fd5814b52f7f982a0ac1fdce763acb39; sid_guard_backstage=fd5814b52f7f982a0ac1fdce763acb39%7C1743867983%7C5183997%7CWed%2C+04-Jun-2025+15%3A46%3A20+GMT; sid_ucp_v1_backstage=1.0.0-KDU1ODE1NmRhMzQ5OGViMWQwMGM2NTZlMTM0ODI3Njk2YTViN2IzOTIKGAiRiIK6g7rxu2cQz6DFvwYYwTU4AUDrBxADGgNzZzEiIGZkNTgxNGI1MmY3Zjk4MmEwYWMxZmRjZTc2M2FjYjM5; ssid_ucp_v1_backstage=1.0.0-KDU1ODE1NmRhMzQ5OGViMWQwMGM2NTZlMTM0ODI3Njk2YTViN2IzOTIKGAiRiIK6g7rxu2cQz6DFvwYYwTU4AUDrBxADGgNzZzEiIGZkNTgxNGI1MmY3Zjk4MmEwYWMxZmRjZTc2M2FjYjM5; passport_fe_beating_status=true; s_v_web_id=verify_m9gihlc2_8gbppzcr_A5rj_4Ino_A9gv_lQTz3CDABUmi; csrf_session_id=b1c1b602e6f7a5c11c16013e0866703a; ttwid=1%7CuIkYKFkCWtjekEiOfKSDxHXh9ACiq61kZQytTeX06tY%7C1744601168%7Cd1ccc5fd6f1945a26a671dd8e8707fb27e481dfe551d5e3002460d17ff1d9272; _ga_GZB380RXJX=GS1.1.1744601169.5.0.1744601169.0.0.950163197; FPLC=MEI6HSYLwMCe6kJjjGSKSWrAkmC8nxnM7ycUWj2lyFfcFmr5tPfZ2NCm9YO4zx3oDOYnBKZUEu%2BAx6o91Hb0HRG%2FM%2By8Qh4YNCyXYMn4EqARC0WGjwpZP5axbBjaOQ%3D%3D; ttcsid=1744601171057.1.1744601171057; ttcsid_CQ6FR3RC77U6L0AM21H0=1744601171057.1.1744601171489; msToken=xKEFwypP6-8kKzRKhEiQXb71V3OqLh0lNHaBIPxDT4cPOXNF1h7p8ZEYMyFiXRPg5Tk__tZPHpSGAF1rZbdWV9U-EIPQmU56I2BqIgxQWzv-a2DL_v4vc7A99pMq0wGp5uB2ziZN; msToken=xKEFwypP6-8kKzRKhEiQXb71V3OqLh0lNHaBIPxDT4cPOXNF1h7p8ZEYMyFiXRPg5Tk__tZPHpSGAF1rZbdWV9U-EIPQmU56I2BqIgxQWzv-a2DL_v4vc7A99pMq0wGp5uB2ziZN',
};

// const GBData = {
//   displayIds: [
//     'kickofffupdates',
//     'mitchaustin10',
//     'mintyaxelive',
//     'paul_mcnally_',
//   ],
//   cookie:
//     '_ga=GA1.1.1464192506.1743925955; FPID=FPID2.2.%2BlUX9HsO4BF8oPtAECJFWWo7pIrCM1zYzvGnUYNk%2BFs%3D.1743925955; FPAU=1.2.83285.1743925955; _fbp=fb.1.1743925954962.1452479820; _ttp=2vLYjLpKNDZ2MvHAK4JQidtqFR0.tt.1; _tt_enable_cookie=1; FPLC=ehMQzZ3tTzKTZmzXHIzI%2B%2BdBMlBMqpTlmedz9h0YpUiPCiqVhTEoqXirx5o9DtgclBYVHs5ZXnaALr%2BEA5l7v52kWnJOkGhio6AkclEgvO5a5165m4GFZWbNZOa%2Fjw%3D%3D; id=22f62cdf80fa00f9||t=1743925955|et=730|cs=002213fd486da0d8509c63cc5c; passport_csrf_token=ad98a7bbaf180cf82d14a98ecc67b6f1; passport_csrf_token_default=ad98a7bbaf180cf82d14a98ecc67b6f1; d_ticket_backstage=e68671b7468d000eea7b5e3a6557fa1214da0; sid_guard_backstage=955ce74ce179648d421b5e5557cd4d5a%7C1743925955%7C5184000%7CThu%2C+05-Jun-2025+07%3A52%3A35+GMT; uid_tt_backstage=5860412960f2716b566054b164b9b451cd0ac571d9449184afdd085a1dd9a0e7; uid_tt_ss_backstage=5860412960f2716b566054b164b9b451cd0ac571d9449184afdd085a1dd9a0e7; sid_tt_backstage=955ce74ce179648d421b5e5557cd4d5a; sessionid_backstage=955ce74ce179648d421b5e5557cd4d5a; sessionid_ss_backstage=955ce74ce179648d421b5e5557cd4d5a; sid_ucp_v1_backstage=1.0.0-KDViZWU0ZWEwYTdmMzdiYzQ4OWQ5YjRiMjRlZmU5ZGVjNzMyMDM4ZGQKGAiSiMiG5sTermcQw-XIvwYYwTU4AUDrBxADGgNzZzEiIDk1NWNlNzRjZTE3OTY0OGQ0MjFiNWU1NTU3Y2Q0ZDVh; ssid_ucp_v1_backstage=1.0.0-KDViZWU0ZWEwYTdmMzdiYzQ4OWQ5YjRiMjRlZmU5ZGVjNzMyMDM4ZGQKGAiSiMiG5sTermcQw-XIvwYYwTU4AUDrBxADGgNzZzEiIDk1NWNlNzRjZTE3OTY0OGQ0MjFiNWU1NTU3Y2Q0ZDVh; s_v_web_id=verify_m95rdxsu_H2Yo6b5J_J4UJ_4JYr_9KsP_rFvfpD6fob6q; ttwid=1%7CQosSxBul_PTzYkJXzRwPYL35847pWJQYX8AUJ7ge6vQ%7C1743950982%7Cd9ef5f50cb130a1b35616e54d9e024b76e68d7daf9a82db372c63690cb896ce4; passport_fe_beating_status=true; csrf_session_id=b1c1b602e6f7a5c11c16013e0866703a; _ga_GZB380RXJX=GS1.1.1743950534.3.1.1743950985.0.0.962750644; msToken=LmvXu7A0vpLq9RIFtPLJBbkl3KlBPqWbV-_zmPy4kZBcfedhcyOeHbPm18T_LKvl-p_K6WAQ2sqGa9VqowRWavRvpjEc-puJuvMQo_LNLR3LcnLHUa6eSCIjlrxnNGhZcWM0FKph; msToken=LmvXu7A0vpLq9RIFtPLJBbkl3KlBPqWbV-_zmPy4kZBcfedhcyOeHbPm18T_LKvl-p_K6WAQ2sqGa9VqowRWavRvpjEc-puJuvMQo_LNLR3LcnLHUa6eSCIjlrxnNGhZcWM0FKph',
// };

export default async function batchCheckAnchorTest() {
  const data = ESData;
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
