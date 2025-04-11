import { Region } from '@tk-crawler/biz-shared';
import {
  ChannelId,
  type ChannelSubTagMap,
  getChannelParamsByChannelId,
  getFeed,
} from '@tk-crawler/tk-requests';
import { getTokens } from '../mock/tokens';

export default async function getFeedTest() {
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
