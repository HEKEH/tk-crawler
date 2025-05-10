import type { UpdateAnchorRequest } from '@tk-crawler/biz-shared';
import type { ThirdPartyId } from '../../types';
import { mysqlClient } from '@tk-crawler/database';
import dayjs from 'dayjs';
import { logger } from '../../infra/logger';

export interface UpdateAnchorData extends UpdateAnchorRequest {
  third_party_id: ThirdPartyId;
  last_diamonds: number | null;
  highest_diamonds: number;
  updated_at: Date | string;
  created_at: Date | string;
}

// function getRandomTime(between: [number, number]) {
//   const now = dayjs();
//   const start = now.subtract(between[0], 'day');
//   const end = now.subtract(between[1], 'day');
//   const randomMs =
//     start.valueOf() + Math.random() * (end.valueOf() - start.valueOf());
//   return dayjs(randomMs).toDate();
// }

const DATE_SUBTRACT = 8; // 减8天，让数据的优先级下降

export async function updateAnchor(data: UpdateAnchorData[]) {
  logger.info('[UpdateAnchor]', `${data.length}条`);
  logger.trace(data);
  try {
    const result = await mysqlClient.prismaClient.anchor.createMany({
      data: data.map(item => {
        const updatedAt = dayjs(item.updated_at)
          .subtract(DATE_SUBTRACT, 'day')
          .toDate();
        const createdAt = dayjs(item.created_at)
          .subtract(DATE_SUBTRACT, 'day')
          .toDate();
        return {
          user_id: BigInt(item.user_id),
          display_id: item.display_id,
          room_id: BigInt(item.room_id),
          region: item.region,
          follower_count: item.follower_count,
          audience_count: item.audience_count,
          level: item.level,
          current_diamonds: item.current_diamonds,
          rank_league: item.rank_league,
          has_commerce_goods: Boolean(item.has_commerce_goods),
          tag: item.tag,
          last_diamonds: item.last_diamonds || null,
          highest_diamonds: item.highest_diamonds,
          created_at: createdAt,
          updated_at: updatedAt,
          third_party_id: item.third_party_id,
        };
      }),
      skipDuplicates: true, // 已有主键的会自动跳过
    });
    logger.info('[UpdateAnchor Result]', result);
  } catch (error) {
    logger.error('[UpdateAnchor Error]', error);
    throw error;
  }
}
