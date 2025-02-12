import { setLogger, setTiktokCookie } from '@tk-crawler/core';
import logger from './logger';
import { mockCookie } from './mock/cookie';
import checkCookieTest from './request-test/check-cookie';
import getFeedTest from './request-test/feed';
// import getAnchorInfoFromGiftListTest from './request-test/get-anchor-info-from-gift-list';
import getAnchorInfoFromEnterTest from './request-test/get-anchor-info-from-enter';

async function main() {
  setLogger(logger);
  setTiktokCookie(mockCookie);
  await checkCookieTest();
  await getFeedTest();
  // await getLiveDiamondsTest();
  await getAnchorInfoFromEnterTest();
  // await getAnchorInfoFromGiftListTest();
}

main();
