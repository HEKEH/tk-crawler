import { setLogger, setTiktokCookie } from '@tk-crawler/tk-requests';
import logger from './logger';
import { mockCookie } from './mock/cookie';
import batchCheckAnchorTest from './request-test/batch-check-anchor';
// import getAnchorInfoFromGiftListTest from './request-test/get-anchor-info-from-gift-list';
// import getAnchorInfoFromEnterTest from './request-test/get-anchor-info-from-enter';

async function main() {
  setLogger(logger);
  setTiktokCookie(mockCookie);
  // await checkCookieTest();
  // await getFeedTest();
  // await getLiveDiamondsTest();
  // await getAnchorInfoFromEnterTest();
  // await getAnchorInfoFromGiftListTest();
  await batchCheckAnchorTest();
}

main();
