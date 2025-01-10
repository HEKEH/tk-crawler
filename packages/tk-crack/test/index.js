debugger;
const webmssdk = require('../crack-job/webmssdk/1.0.0.655/webmssdk-node.js');
webmssdk.init({
  aid: 1,
  isSDK: false,
  boe: false,
  enablePathList: [],
  region: 'sg-tiktok',
  mode: 513,
});

console.log(
  webmssdk.getXbogus(
    'requestFrom=portal&msToken=TjV4nPQk_voIo5cr9vvgr8j0_j4kS2hPcbu_x7LVjyEfd4HLFvkgrttv84TItJt4cqlg6py775VpTQgFzYW1EXhKanytziXhESxfddeUHSmAr61L-r-bHr2bAvE6JQlsHhnbDwd3Z4E=',
    '{a: "123"}',
  ),
);
