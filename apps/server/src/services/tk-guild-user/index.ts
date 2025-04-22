import type {
  Area,
  BroadcastGuildUserCreateMessage,
  BroadcastGuildUserDeleteMessage,
  BroadcastGuildUserUpdateMessage,
  CreateTKGuildUserRequest,
  CreateTKGuildUserResponse,
  DeleteTKGuildUserRequest,
  DeleteTKGuildUserResponse,
  GetTKGuildUserDetailRequest,
  GetTKGuildUserListRequest,
  GetTKGuildUserListResponseData,
  UpdateTKGuildUserRequest,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import {
  ServerBroadcastMessageChannel,
  TKGuildUserStatus,
} from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';
import { getAnchorCheckCount } from '@tk-crawler/server-shared';
import {
  isEmpty,
  simpleDecrypt,
  transObjectValuesToString,
  xss,
} from '@tk-crawler/shared';
import config from '../../config';
import { logger } from '../../infra/logger';
import { transformTKGuildUserFilterValues } from './filter';

// Get TK Guild User list
export async function getTKGuildUserList(
  data: GetTKGuildUserListRequest & {
    org_id: string;
  },
): Promise<GetTKGuildUserListResponseData> {
  logger.info('[Get TK Guild User List]', { data });

  const _orderBy = isEmpty(data.order_by)
    ? {
        id: 'asc' as const,
      }
    : data.order_by!;

  const filter = transformTKGuildUserFilterValues(data.filter, data.org_id);

  const [users, total] = await Promise.all([
    mysqlClient.prismaClient.liveAdminUser.findMany({
      where: filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy: _orderBy,
    }),
    mysqlClient.prismaClient.liveAdminUser.count({
      where: filter,
    }),
  ]);

  const queryCountList = await getAnchorCheckCount(
    users.map(user => ({
      org_id: data.org_id,
      guild_user_id: user.id.toString(),
    })),
    logger,
  );

  return {
    list: users.map(({ area, ...user }, index) => {
      return {
        ...transObjectValuesToString(user, ['id', 'org_id']),
        area: area as Area,
        current_query_per_hour: queryCountList[index].query_per_hour,
        current_query_per_day: queryCountList[index].query_per_day,
      };
    }),
    total,
  };
}

// Get TK Guild User detail
export async function getTKGuildUserDetail(
  data: GetTKGuildUserDetailRequest & {
    org_id: string;
  },
) {
  logger.info('[Get TK Guild User Detail]', { data });
  assert(data.id, '用户ID不能为空');

  const user = await mysqlClient.prismaClient.liveAdminUser.findUnique({
    where: {
      id: BigInt(data.id),
      org_id: BigInt(data.org_id),
    },
  });

  assert(user, '用户不存在');

  return transObjectValuesToString(user, ['id', 'org_id']);
}

// Create TK Guild User
export async function createTKGuildUser(
  _data: CreateTKGuildUserRequest & {
    org_id: string;
  },
): Promise<CreateTKGuildUserResponse['data']> {
  const data = {
    ..._data,
    username: _data.username?.trim(),
  };
  logger.info('[Create TK Guild User]', { data });

  const { username, password, org_id } = data;
  assert(username, '用户名不能为空');
  assert(password, '密码不能为空');
  assert(org_id, '机构ID不能为空');

  return await mysqlClient.prismaClient.$transaction(async tx => {
    const existUser = await tx.liveAdminUser.findFirst({
      where: {
        username,
      },
      select: { id: true },
    });

    assert(!existUser, '用户已存在，不能重复添加');

    const { org_id, ...restData } = data;

    // Create user
    const user = await tx.liveAdminUser.create({
      data: {
        ...restData,
        status: TKGuildUserStatus.INACTIVE,
        org_id: BigInt(org_id),
      },
    });
    const message: BroadcastGuildUserCreateMessage = {
      type: 'create',
      data: {
        id: user.id.toString(),
        org_id: user.org_id.toString(),
        username: user.username,
        status: user.status,
        max_query_per_hour: user.max_query_per_hour,
        max_query_per_day: user.max_query_per_day,
        cookie: user.cookie,
        faction_id: user.faction_id,
        area: user.area as Area | null,
      },
    };
    redisMessageBus.publish(
      ServerBroadcastMessageChannel.GuildUserMessage,
      message,
    );
    return { id: user.id.toString() };
  });
}

// Update TK Guild User
export async function updateTKGuildUser(
  _request: UpdateTKGuildUserRequest & { org_id: string },
): Promise<void> {
  const request = {
    ..._request,
    data: {
      ..._request.data,
      username: _request.data.username?.trim(),
    },
  };
  logger.info('[Update TK Guild User]', { request });

  const { id } = request.data;
  assert(id, '用户ID不能为空');

  const { org_id } = request;
  assert(org_id, '机构ID不能为空');

  await mysqlClient.prismaClient.$transaction(async tx => {
    // Check if user exists
    const existUser = await tx.liveAdminUser.findUnique({
      where: {
        id: BigInt(id),
        org_id: BigInt(org_id),
      },
      select: { id: true, username: true, password: true },
    });
    assert(existUser, '用户不存在');

    // eslint-disable-next-line ts/no-unused-vars
    const { id: _, ...updateData } = request.data;

    // Apply XSS protection to string fields
    if (updateData.username) {
      updateData.username = xss(updateData.username);
    }
    if (updateData.area) {
      updateData.area = xss(updateData.area);
    }

    // 如果用户名或密码有变更，则将用户状态设置为未激活
    if (
      (updateData.username && updateData.username !== existUser.username) ||
      (updateData.password &&
        simpleDecrypt(updateData.password, config.simplePasswordKey) !==
          simpleDecrypt(existUser.password, config.simplePasswordKey))
    ) {
      updateData.status = TKGuildUserStatus.INACTIVE;
    }

    // Update user
    await tx.liveAdminUser.update({
      where: {
        id: BigInt(id),
      },
      data: updateData,
    });
    const message: BroadcastGuildUserUpdateMessage = {
      type: 'update',
      data: {
        id,
        org_id,
        username: updateData.username,
        status: updateData.status,
        max_query_per_hour: updateData.max_query_per_hour,
        max_query_per_day: updateData.max_query_per_day,
        faction_id: updateData.faction_id,
        area: updateData.area,
      },
    };
    redisMessageBus.publish(
      ServerBroadcastMessageChannel.GuildUserMessage,
      message,
    );
  });
}

// Delete TK Guild User
export async function deleteTKGuildUser(
  data: DeleteTKGuildUserRequest & { org_id: string },
): Promise<DeleteTKGuildUserResponse['data']> {
  logger.info('[Delete TK Guild User]', { data });
  assert(data.ids.length > 0, '用户ID不能为空');
  assert(data.org_id, '机构ID不能为空');

  const resp = await mysqlClient.prismaClient.$transaction(async prisma => {
    const resp = await prisma.liveAdminUser.deleteMany({
      where: {
        id: { in: data.ids.map(id => BigInt(id)) },
        org_id: BigInt(data.org_id),
      },
    });

    return {
      deleted_count: resp.count,
    };
  });
  const message: BroadcastGuildUserDeleteMessage = {
    type: 'delete',
    data: {
      org_id: data.org_id,
      ids: data.ids,
    },
  };
  redisMessageBus.publish(
    ServerBroadcastMessageChannel.GuildUserMessage,
    message,
  );
  return resp;
}

export * from './start-or-stop-account';
