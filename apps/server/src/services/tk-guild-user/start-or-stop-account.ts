import type {
  BroadcastGuildUserUpdateMessage,
  StartTKLiveAdminAccountRequest,
  StopTKLiveAdminAccountRequest,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import {
  ServerBroadcastMessageChannel,
  TKGuildUserStatus,
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';
import { omit } from 'lodash';
import { BusinessError } from '../../utils';

// Update TK Guild User Cookie
// export async function updateTKGuildUserCookie(
//   data: UpdateTKGuildUserCookieRequest & { org_id: string },
// ): Promise<void> {
//   logger.info('[Update TK Guild User Cookie]', { data });

//   const { id, cookie, org_id } = data;
//   assert(id, '用户ID不能为空');
//   assert(cookie, 'Cookie不能为空');
//   assert(org_id, '机构ID不能为空');

//   await mysqlClient.prismaClient.$transaction(async tx => {
//     // Check if user exists
//     const existUser = await tx.liveAdminUser.findUnique({
//       where: {
//         id: BigInt(id),
//         org_id: BigInt(org_id),
//       },
//       select: { id: true },
//     });

//     assert(existUser, '用户不存在');

//     await tx.liveAdminUser.update({
//       where: {
//         id: BigInt(id),
//         org_id: BigInt(org_id),
//       },
//       data: {
//         cookie,
//         status: TKGuildUserStatus.WAITING,
//       },
//     });
//   });
// }

export async function startLiveAdminAccount(
  data: StartTKLiveAdminAccountRequest & { org_id: string },
): Promise<void> {
  const { user_id, org_id, cookie, faction_id, area } = data;
  assert(user_id, '用户ID不能为空');
  assert(cookie, 'Cookie不能为空');
  assert(faction_id, '分区ID不能为空');
  assert(area, '分区参数不能为空');
  const user = await mysqlClient.prismaClient.liveAdminUser.findUnique({
    where: {
      id: BigInt(user_id),
      org_id: BigInt(org_id),
    },
    include: {
      organization: {
        include: {
          areas: {
            select: {
              area: true,
            },
          },
        },
      },
    },
  });

  assert(user, '用户不存在');

  if (!user.organization.areas.some(item => item.area === area)) {
    throw new BusinessError('当前机构不支持当前账号的分区');
  }

  if (VALID_GUILD_USER_STATUS_LIST.includes(user.status)) {
    return;
    // throw new BusinessError('用户已启动');
  }

  const updateData = {
    status: TKGuildUserStatus.WAITING,
    cookie,
    faction_id,
    area,
    started_at: new Date(),
    error_at: null,
    warning_count: 0,
  };
  await mysqlClient.prismaClient.liveAdminUser.update({
    where: {
      id: BigInt(user_id),
    },
    data: updateData,
  });
  const message: BroadcastGuildUserUpdateMessage = {
    type: 'update',
    data: {
      id: user_id,
      org_id,
      ...omit(updateData, 'started_at', 'error_at'),
    },
  };
  redisMessageBus.publish(
    ServerBroadcastMessageChannel.GuildUserMessage,
    message,
  );
}

export async function stopLiveAdminAccount(
  data: StopTKLiveAdminAccountRequest & { org_id: string },
): Promise<void> {
  const { user_id, org_id } = data;
  assert(user_id, '用户ID不能为空');
  const user = await mysqlClient.prismaClient.liveAdminUser.findUnique({
    where: {
      id: BigInt(user_id),
      org_id: BigInt(org_id),
    },
  });

  assert(user, '用户不存在');

  if (
    [TKGuildUserStatus.INACTIVE, TKGuildUserStatus.STOPPED].includes(
      user.status,
    )
  ) {
    return;
  }

  const updateData = {
    status: TKGuildUserStatus.STOPPED,
    warning_count: 0,
    started_at: null,
    error_at: null,
  };

  await mysqlClient.prismaClient.liveAdminUser.update({
    where: {
      id: BigInt(user_id),
    },
    data: updateData,
  });
  const message: BroadcastGuildUserUpdateMessage = {
    type: 'update',
    data: {
      id: user_id,
      org_id,
      ...omit(updateData, 'started_at', 'error_at'),
    },
  };
  redisMessageBus.publish(
    ServerBroadcastMessageChannel.GuildUserMessage,
    message,
  );
}
