import { USER_AGENT } from '../constants';

export const TIKTOK_LIVE_ADMIN_URL = 'https://live-backstage.tiktok.com';

export const COMMON_TIKTOK_LIVE_ADMIN_HEADERS = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
  'cache-control': 'no-cache',
  'content-type': 'application/json',
  'faction-id': '107003',
  origin: TIKTOK_LIVE_ADMIN_URL,
  pragma: 'no-cache',
  priority: 'u=1, i',
  referer: `${TIKTOK_LIVE_ADMIN_URL}/portal/overview`,
  'sec-ch-ua':
    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': USER_AGENT,
  'x-appid': '1180',
  'x-csrf-token': 'qYlITCdN-By_oK8eCLyPdibdsqkyQ8J6oF4k',
  'x-language': 'zh-CN',
};

// const TEMP_COOKIES_OBJECT = {
//   tt_csrf_token: 'rIVfXD0b-Z2NRtwhpqIsu41EdwDwZuvjfeaM',
//   tt_chain_token: 'OKDmmlnPxp31hNukKy5NRw==',
//   passport_csrf_token: '54adee964987c315a6007dd41669f9f9',
//   passport_csrf_token_default: '54adee964987c315a6007dd41669f9f9',
//   s_v_web_id: 'verify_m52hrc4l_v9BjnSlX_ktqz_47El_9BFS_HM7tZdDsReIb',
//   'store-country-code-src': 'uid',
//   _ga: 'GA1.1.74205259.1735046489',
//   FPID: 'FPID2.2.jFNBr0YlmfhRbKfPsim1pJJdbBcnhoUaztc3AqqJ5UM=.1735046489',
//   FPAU: '1.2.1371985790.1735046489',
//   csrfToken: 'qYlITCdN-By_oK8eCLyPdibdsqkyQ8J6oF4k',
//   passport_auth_status:
//     '9108bd989e5b1d67ec65adf2e0edd3f1,0cbedb16724e89f123c5596562d25e7c',
//   passport_auth_status_ss:
//     '9108bd989e5b1d67ec65adf2e0edd3f1,0cbedb16724e89f123c5596562d25e7c',
//   multi_sids: '7451967190302032901:fd1f4676a5ff3aa176480b971186eb7f',
//   cmpl_token: 'AgQQAPOqF-RO0rdUWgrv4108_QstT75K_5AhYNr8MA',
//   sid_guard:
//     'fd1f4676a5ff3aa176480b971186eb7f|1735630342|15552000|Sun,29-Jun-2025+07:32:22+GMT',
//   uid_tt: '5a2a63ea2203ca8b212a124d5bdba0d9397bfaa85e055c64396b26b6b1e924d9',
//   uid_tt_ss: '5a2a63ea2203ca8b212a124d5bdba0d9397bfaa85e055c64396b26b6b1e924d9',
//   sid_tt: 'fd1f4676a5ff3aa176480b971186eb7f',
//   sessionid: 'fd1f4676a5ff3aa176480b971186eb7f',
//   sessionid_ss: 'fd1f4676a5ff3aa176480b971186eb7f',
//   sid_ucp_v1:
//     '1.0.0-KDQwYmIwY2YzNmFmZmZmMDA5ODllYzQyZDA5OTI3ODEwZjJjZmI3NTUKIgiFiMa-1pWttWcQhrzOuwYYswsgDDDH6aq7BjgBQOsHSAQQAxoGbWFsaXZhIiBmZDFmNDY3NmE1ZmYzYWExNzY0ODBiOTcxMTg2ZWI3Zg',
//   ssid_ucp_v1:
//     '1.0.0-KDQwYmIwY2YzNmFmZmZmMDA5ODllYzQyZDA5OTI3ODEwZjJjZmI3NTUKIgiFiMa-1pWttWcQhrzOuwYYswsgDDDH6aq7BjgBQOsHSAQQAxoGbWFsaXZhIiBmZDFmNDY3NmE1ZmYzYWExNzY0ODBiOTcxMTg2ZWI3Zg',
//   'store-idc': 'alisg',
//   'store-country-code': 'jp',
//   'tt-target-idc': 'alisg',
//   'tt-target-idc-sign':
//     'uJh093gkXc8V62Szo4hKTjv2X7EfRf1OuAZcGhvJ-d0_SBYYdYq_K3tjJV72WLPszGZgH89xdbKWs8yXCmTVnOF8l6GDg0ZZ3PH7-eoQTxfhMWAGIN5bs84WKt0MzeqO30D1Ni3FaidhPP0hHy3UfEiBaK6GC1kKN1-RwaZqIGP5W54ri03rnoM4RtsVHV3hLFVaOK_AJxYRSUgSPV_uF6KKgDfXEe7EutMWXMc_VwZZ-Pyy9qNQLWndrAAnvvEn4gObocAolYgf8eOAgP_g4wwzSz6e65AZl004GgmSDhmF8O_4dJnsj1qCmw3uVqmB0fKhqRmdVHcLQaUNv-4TAglB2wTzXrKPz8lGjH0gaaLfkWNXTH2CLoqp-owlKgnBxKD4i4WNe-i1hZQdZmc6r-FF1xEvmf7ZgEmo0bZnWaWgMZyfH2L6ZeqMN7-KepVtzSrP716U7gdlUup9ZzYBQ8KPIfvEC9_d2zABpOHHaUV6QvELH5BtMbj2xtp3_Hb3',
//   _ttp: '2jPtYbFFBJp2dkZbJ5GSTck3sTP.tt.1',
//   _tt_enable_cookie: '1',
//   d_ticket_backstage: '0ee3bf0c39085a141351bdf40f407c96b1b58',
//   sid_guard_backstage:
//     '4af0d0888aae0b525a779b29694a10d2|1735724638|5183999|Sun,02-Mar-2025+09:43:57+GMT',
//   uid_tt_backstage:
//     'f3ec03110967d9a38cbe8f37c6ac6e3771d0593cc611f31f13c865c24262eeb2',
//   uid_tt_ss_backstage:
//     'f3ec03110967d9a38cbe8f37c6ac6e3771d0593cc611f31f13c865c24262eeb2',
//   sid_tt_backstage: '4af0d0888aae0b525a779b29694a10d2',
//   sessionid_backstage: '4af0d0888aae0b525a779b29694a10d2',
//   sessionid_ss_backstage: '4af0d0888aae0b525a779b29694a10d2',
//   sid_ucp_v1_backstage:
//     '1.0.0-KDM1YWY4YWIxZGM5NzlhZDMwNGE2OTc2YjBiMTQ3ZmFlMDQzYWY2MTgKIAiIiJy-2oTVrmcQ3pzUuwYYwTUgDDC8q_W6BjgBQOsHEAMaA3NnMSIgNGFmMGQwODg4YWFlMGI1MjVhNzc5YjI5Njk0YTEwZDI',
//   ssid_ucp_v1_backstage:
//     '1.0.0-KDM1YWY4YWIxZGM5NzlhZDMwNGE2OTc2YjBiMTQ3ZmFlMDQzYWY2MTgKIAiIiJy-2oTVrmcQ3pzUuwYYwTUgDDC8q_W6BjgBQOsHEAMaA3NnMSIgNGFmMGQwODg4YWFlMGI1MjVhNzc5YjI5Njk0YTEwZDI',
//   csrf_session_id: 'a52d0e38feb176f744ecbba8a425a005',
//   tiktok_webapp_lang: 'zh-Hant-TW',
//   _ga_LWWPCY99PB: 'GS1.1.1735728238.16.1.1735729511.0.0.1465565341',
//   // odin_tt: '4c871679353c1b9d81319a5225be5463816c6714e90b4d31844d8937d90922a4580dc72f703b92c0b7cb8c4402eac7f6c0b1f01b42e3aae469339a616cfb65d9',
//   _fbp: 'fb.1.1736255175612.2064404046',
//   FPLC: 'iB/cRPgQ0ndEPpaNprG98Vuawnz5KrH22Hb6Z/F6+BepiCwzTO9JAn/SvR5XqKA1Qrxg/Yx521SVtvQjN1NeNMJy+DpVtpVARixKMneX4UOoYt3/3xGqqUElIeH9WkQ==',
//   ttwid:
//     '1|OTe74t2gzOYPJZub12kjBn7xcNFbGBBQbyx_GbPghUw|1736486000|bd750a32bdaeef8252427acab2517a563867fa130433fba4ca0fcab7b5665680',
//   passport_fe_beating_status: 'true',
//   odin_tt:
//     'c2b47c18c58aa167087741b1e3351fa959c99c1e8ebe03bb49d946de39c48fb400c0fb0172fca91f528a7eb5f96d968f9967f1380415200db392bfd35ac81fa0',
//   msToken:
//     'bHm7zTIwHOCnY4ZwY7BIci4xYsZsXHjt_uuNJmORTZ_DfWye6Pi9p_NSKI-4yu96eQ55myS0_xbVEfIgNITqXHiSk-PXgjdE3cvol06v6XqfI-bqEvqNX0Xera2Qx-A1kKawwIBdv0Y=',
//   _ga_GZB380RXJX: 'GS1.1.1736488786.43.0.1736488786.0.0.1028050655',
// };

// export const TEMP_COOKIE = Object.entries(TEMP_COOKIES_OBJECT)
//   .map(([key, value]) => `${key}=${value}`)
//   .join('; ');
