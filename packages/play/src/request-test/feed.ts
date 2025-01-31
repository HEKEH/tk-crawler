// import { LiveAnchorCrawler } from '@tk-crawler/core';
import { ChannelId, getFeed } from '@tk-crawler/core/requests/live';
import {
  type ChannelSubTagMap,
  getChannelParamsByChannelId,
} from '@tk-crawler/core/requests/utils/params';
import { Region } from '@tk-crawler/shared/types';
import { getTokens } from '../mock/tokens';

export default async function getFeedTest() {
  // const crawler = new LiveAnchorCrawler({
  //   crawlerInterval: 1000,
  // });
  // crawler.start({
  //   settings: {
  //     region: 'all',
  //   } as any,
  //   onAnchorsCollected: () => {},
  // });
  const channelId = ChannelId.GAMING;
  const channelParams = getChannelParamsByChannelId(
    channelId,
    Object.fromEntries(
      Object.entries({
        [ChannelId.GAMING]: [
          {
            tag: 'Garena Free Fire',
            weight: 91332,
          },
        ],
      }).map(([key, value]) => [key, [...value]]),
    ) as ChannelSubTagMap,
  );
  const feed = await getFeed({
    region: [Region.US],
    tokens: getTokens(),
    channelParams,
  });
  return feed;
}
