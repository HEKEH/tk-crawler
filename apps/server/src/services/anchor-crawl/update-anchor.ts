import {
  type BroadcastAnchorMessage,
  ServerBroadcastMessageChannel,
  type UpdateAnchorRequest,
} from '@tk-crawler/biz-shared';
import { mysqlClient, Prisma, redisMessageBus } from '@tk-crawler/database';

export async function updateAnchor(data: UpdateAnchorRequest) {
  // 因为查询较为复杂，所以使用原生sql
  const {
    user_id,
    display_id,
    room_id,
    region,
    follower_count,
    audience_count,
    level,
    current_diamonds,
    rank_league,
    has_commerce_goods,
    tag,
  } = data;
  const sql = Prisma.sql`
  INSERT INTO Anchor (
    user_id,
    display_id,
    room_id,
    region,
    follower_count,
    audience_count,
    level,
    current_diamonds,
    rank_league,
    has_commerce_goods,
    tag,
    highest_diamonds,
    updated_at
  )
  VALUES (
    ${user_id},
    ${display_id},
    ${room_id},
    ${region},
    ${follower_count},
    ${audience_count},
    ${level},
    ${current_diamonds},
    ${rank_league},
    ${has_commerce_goods},
    ${tag},
    ${current_diamonds},
    CURRENT_TIMESTAMP(3)
  )
  ON DUPLICATE KEY UPDATE
    display_id = ${display_id},
    -- 如果房间id发生变化，则更新last_diamonds
    last_diamonds = IF(room_id != VALUES(room_id), current_diamonds, last_diamonds),
    -- 因为current_diamonds的计算方式是有问题的，总是会小于或等于真实的钻石数，所以如果之前的current_diamonds较大，则不更新
    current_diamonds = IF(room_id != VALUES(room_id), ${current_diamonds}, GREATEST(${current_diamonds}, current_diamonds)),
    highest_diamonds = GREATEST(${current_diamonds}, highest_diamonds),
    room_id = ${room_id},
    region = ${region},
    follower_count = ${follower_count},
    audience_count = ${audience_count},
    level = ${level},
    rank_league = ${rank_league},
    has_commerce_goods = ${has_commerce_goods},
    tag = ${tag},
    updated_at = CURRENT_TIMESTAMP(3),
    third_party_id = null
`;
  await mysqlClient.prismaClient.$executeRaw(sql);
  const message: BroadcastAnchorMessage = {
    data: {
      user_id,
      display_id,
      region,
      has_commerce_goods,
    },
  };
  redisMessageBus.publish(ServerBroadcastMessageChannel.AnchorMessage, message);
}
