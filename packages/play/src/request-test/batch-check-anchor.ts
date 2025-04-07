import { getFactionIdAndArea } from '@tk-crawler/biz-shared';
import { batchCheckAnchor } from '@tk-crawler/core/requests/live-admin';
import logger from '../logger';

const ESData = {
  displayIds: ['tamara_bareta_directos', 'agua.cristalina1'],
  cookie:
    's_v_web_id=verify_m95s7mdb_xVt46qfp_pIgb_4SQV_84dC_ExM1xfaxCtFB; _ga=GA1.1.1928636640.1743952370; FPID=FPID2.2.8spHJTBkA3mpRi8ZoPvVmQmVKvKqUMMlNz432wcRkkw%3D.1743952370; FPAU=1.2.1864387165.1743952370; _fbp=fb.1.1743952370084.1037221814; _ttp=2vMQGnA1Uk8JLdaW4jiF3SCVqhW.tt.1; _tt_enable_cookie=1; FPLC=gcfqhTJLTRYfJryoEJEjrpej0vYChecBj7TMusAqjo1bNW8m6xqrgCkflgSRT40ILunTYr4jN10Dj4Gsl%2BQBW7GMaVfkI8GxBcGCesbWbcDD0XTUZcRoFtgh8%2FkW2g%3D%3D; passport_csrf_token=252c8c26cf03ee4fb7831d41b03cc453; passport_csrf_token_default=252c8c26cf03ee4fb7831d41b03cc453; d_ticket_backstage=8461766e1c54b9247d8c54e01bc6cff9b952c; uid_tt_backstage=dd4ca86ca0315ace36e629b1698aa7d41cbad7649ee2b620bf907d580eb3eb9d; uid_tt_ss_backstage=dd4ca86ca0315ace36e629b1698aa7d41cbad7649ee2b620bf907d580eb3eb9d; sid_tt_backstage=1ae6e653a46ff28f3bf5e9b99b346751; sessionid_backstage=1ae6e653a46ff28f3bf5e9b99b346751; sessionid_ss_backstage=1ae6e653a46ff28f3bf5e9b99b346751; id=224eed0cedf7000a||t=1743952371|et=730|cs=002213fd484dfbd9f7b4c11db3; sid_guard_backstage=1ae6e653a46ff28f3bf5e9b99b346751%7C1743952373%7C5183997%7CThu%2C+05-Jun-2025+15%3A12%3A50+GMT; sid_ucp_v1_backstage=1.0.0-KDM4ZjM3NjVkNjU3YmRiNGNiYTUzYjMyNjk1Njk2MjQ2ZGM2NzM4NjQKGAiSiMvQoJLyu2cQ9bPKvwYYwTU4AUDrBxADGgNzZzEiIDFhZTZlNjUzYTQ2ZmYyOGYzYmY1ZTliOTliMzQ2NzUx; ssid_ucp_v1_backstage=1.0.0-KDM4ZjM3NjVkNjU3YmRiNGNiYTUzYjMyNjk1Njk2MjQ2ZGM2NzM4NjQKGAiSiMvQoJLyu2cQ9bPKvwYYwTU4AUDrBxADGgNzZzEiIDFhZTZlNjUzYTQ2ZmYyOGYzYmY1ZTliOTliMzQ2NzUx; passport_fe_beating_status=true; ttwid=1%7CIYTMgFQjancNiptUem5K-5FjcV_PJFq3NxMJpKnR2ZQ%7C1743952375%7Cd1996a4fdede2177415e82fb1d729bd2c558deb1fd44e46fe9683fd4898351b4; _ga_GZB380RXJX=GS1.1.1743952369.1.1.1743952376.0.0.1700330128; csrf_session_id=b1c1b602e6f7a5c11c16013e0866703a; msToken=di-VfkrijdXldDCD4kpeUZnbxW10PcLbuPHQ8TzI9cnKUAmPEgtHuV6De7B470P5DdNzKAuLa62AXqCvJr5mF2jzm_XsLhfT6rtsQ-xVTduHIP0zcRNCj-wgM1dmWYEj3AOrk7M=; msToken=di-VfkrijdXldDCD4kpeUZnbxW10PcLbuPHQ8TzI9cnKUAmPEgtHuV6De7B470P5DdNzKAuLa62AXqCvJr5mF2jzm_XsLhfT6rtsQ-xVTduHIP0zcRNCj-wgM1dmWYEj3AOrk7M=',
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
  const res = await batchCheckAnchor({
    ...data,
    factionId,
  });
  console.log(res, 'batchCheckAnchor');
  return res;
}
