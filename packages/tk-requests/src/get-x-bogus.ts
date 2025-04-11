// import xBogus from 'tk-crack/xbogus-old';
// 用于tiktok
import webmssdk170 from 'tk-crack/webmssdk-170';

let webmssdk170Initiated = false;

function initWebmssdk170() {
  if (webmssdk170Initiated) {
    return;
  }
  webmssdk170Initiated = true;
  webmssdk170.init({
    aid: 1988,
    dfp: false,
    boe: false,
    intercept: true,
    enablePathList: [
      '/node/share/',
      '/share/item/list',
      '/discover/render/undefined',
      '/share/item/explore/list',
      '/api/comment/list/',
      '/api/comment/list/reply/',
      '/api/commit/follow/user/',
      '/api/commit/item/digg/',
      '/aweme/v1/upload/image2/',
      '/api/notice/multi/',
      '/api/notice/count/',
      '/api/notice/digg/list/',
      '/api/user/following/request/list/',
      '/api/commit/follow/request/approve/',
      '/api/commit/follow/request/reject/',
      '/api/comment/digg/',
      '/api/comment/publish/',
      '/api/comment/delete/',
      '/api/sticker/item_list/',
      '/api/user/contact/list/',
      '/api/at/default/list/',
      '/api/comment/search/user/',
      '/web/aweme/v1/search/challengesug',
      '/web/aweme/v1/discover/search/',
      '/api/v1/item/create/',
      '/api/ba/business/suite/permission/list',
      '/api/search/user/full/',
      '/api/search/user/preview/',
      '/api/search/item/full/',
      '/api/search/general/full/',
      '/api/music/detail/',
      '/api/challenge/detail/',
      '/api/user/detail/',
      '/api/user/list/',
      '/api/item/detail/',
      '/api/question/detail/',
      '/api/question/item_list/',
      '/api/discover/challenge/',
      '/api/discover/user/',
      '/api/discover/music/',
      '/api/challenge/item_list/',
      '/api/music/item_list/',
      '/api/post/item_list/',
      '/api/favorite/item_list/',
      '/api/following/item_list/',
      '/api/recommend/item_list/',
      '/api/recommend/user/',
      '/api/recommend/embed_videos/',
      '/api/live/detail/',
      '/api/im/multi_user/',
      '/api/user/get/animation/',
      '/api/user/settings/',
      '/aweme/v1/music/list/',
      '/aweme/v1/adult/verify/get/accepted/id/types/',
      '/api/mix/detail',
      '/api/mix/item_list',
      '/api/uniqueid/check/',
      '/api/user/playlist/',
      '/api/reflow/item/detail/',
      '/api/reflow/user/detail/',
      '/api/reflow/recommend/item_list/',
      '/api/reflow/challenge/item_list/',
      '/api/reflow/post/item_list/',
      '/api/reflow/sticker/item_list/',
      '/api/reflow/playlist/item_list/',
      '/api/reflow/survey/detail/',
      '/api/reflow/repost/item_list/',
      '/api/impression/write/',
      '/api/user/set/animation/',
      '/api/aweme/set/react_duet_stitch/',
      '/api/aweme/modify/visibility/',
      '/api/aweme/delete/',
      '/api/schedule/aweme/delete/',
      '/passport/web/login_name/update/',
      '/api/update/profile/',
      '/api/commit/follow/request/approve/',
      '/api/commit/follow/request/reject/',
      '/api/commit/follow/user/',
      '/tiktok/v1/username/save_async/',
      '/api/ba/business/suite/account/off',
      '/api/ba/business/suite/account/quitcheck',
      '/api/playlist/create_with_items/',
      '/api/playlist/update/',
      '/api/playlist/modify_items/',
      '/api/item/collect',
      '/node/report/reasons',
      '/aweme/v1/aweme/feedback/',
      '/aweme/v2/aweme/feedback/',
      '/webcast.*',
      '/v1/message/send',
      '/v2/conversation/create',
      '/v1/voip/call',
      '/v1/conversation/add_participants',
      '/1/conversation/remove_participants',
      '/v1/conversation/update_participant',
      '/v1/conversation/set_setting_info',
      '/v1/conversation/get_setting_info',
      '/v1/conversation/upsert_core_ext_info',
      '/v1/conversation/upsert_settings_ext',
      '/v1/conversation/dissolve',
      '/v1/message/mark',
      '/v1/message/batch_unmark',
      '/v1/message/set_property',
      '/api-live/event/list',
      '/api-live/event/related-videos',
      '/api-live/event/detail',
      '/api-live/share/live',
      '/api-live/user/room',
      '/node-a/send/download_link',
      '/api/uniqueid/check/',
      '/api/v3/register/user/info/sync/',
      '/api/policy/notice/approve/',
      '/api/private_banner/ack/',
      '/api/privacy/agreement/record/agree/v1',
      '/api/v3/register/verification/age/',
      '/api/register/check/login/name/',
      '/api/user/detail/self/',
      '/passport/web/',
      '/shorten/',
      '/api/seo/kap/product_list/',
      '/bi/notification/reporter/record',
    ],
    region: 'sg-tiktok',
    mode: 516,
    isSDK: false,
  });
}

export function getXBogus(
  url: string,
  body?: string | Record<string, any>,
): string {
  // if (!body) {
  //   // get请求
  //   return xBogus(url, USER_AGENT);
  // }
  initWebmssdk170();
  let _body;
  if (body) {
    _body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const query = url.includes('?') ? url.split('?')[1] || '' : '';
  const res = webmssdk170.getXBogus(query, _body);
  return res;
}

// let webmssdkInitiated = false;

// function initWebmssdk() {
//   if (webmssdkInitiated) {
//     return;
//   }
//   webmssdkInitiated = true;
//   webmssdk.init({
//     aid: 1,
//     isSDK: false,
//     boe: false,
//     enablePathList: [],
//     region: 'sg-tiktok',
//     mode: 513,
//   });
// }

// /** 在Live管理中使用。暂时弃用 */
// export function getXBogusForTiktokLiveAdmin(
//   url: string,
//   body?: string | Record<string, any>,
// ): string {
//   initWebmssdk();
//   let _body;
//   if (body) {
//     _body = typeof body === 'string' ? body : JSON.stringify(body);
//   }
//   const res = webmssdk.getXBogus(url, _body);
//   return res;
// }
