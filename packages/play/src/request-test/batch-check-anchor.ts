import { batchCheckAnchor } from '@tk-crawler/core/requests/live-admin';
import { mockLiveAdminCookie } from '../mock/cookie';

export default async function batchCheckAnchorTest() {
  const res = await batchCheckAnchor({
    displayIds: [
      'kickofffupdates',
      'mitchaustin10',
      'mintyaxelive',
      'paul_mcnally_',
    ],
    cookie: mockLiveAdminCookie,
  });
  console.log(res, 'batchCheckAnchor');
  return res;
}
