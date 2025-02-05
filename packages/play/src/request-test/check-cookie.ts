import { checkTiktokCookieValid } from '@tk-crawler/core/requests/live';
import { getTokens } from '../mock/tokens';

export default async function checkCookieTest() {
  const valid = await checkTiktokCookieValid({
    tokens: getTokens(),
  });
  console.log('valid=', valid);
  return valid;
}
