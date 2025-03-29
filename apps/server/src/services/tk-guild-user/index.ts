import assert from 'node:assert';
import {
  type CreateTKGuildUserRequest,
  type CreateTKGuildUserResponse,
  type DeleteTKGuildUserRequest,
  type DeleteTKGuildUserResponse,
  type GetTKGuildUserDetailRequest,
  type GetTKGuildUserListRequest,
  type GetTKGuildUserListResponseData,
  TKGuildUserStatus,
  type UpdateTKGuildUserCookieRequest,
  type UpdateTKGuildUserRequest,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty, transObjectValuesToString, xss } from '@tk-crawler/shared';
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
        updated_at: 'desc' as const, // Default sort by updated_at desc
      }
    : data.order_by!;

  const filter = transformTKGuildUserFilterValues(data.filter, data.org_id);

  const [users, total] = await Promise.all([
    mysqlClient.prismaClient.liveAdminUser.findMany({
      where: filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy: _orderBy,
      omit: {
        cookie: true,
      },
    }),
    mysqlClient.prismaClient.liveAdminUser.count({
      where: filter,
    }),
  ]);

  return {
    list: users.map(user => {
      return transObjectValuesToString(user, ['id', 'org_id']);
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
  data: CreateTKGuildUserRequest & {
    org_id: string;
  },
): Promise<CreateTKGuildUserResponse['data']> {
  logger.info('[Create TK Guild User]', { data });

  const { username, password, org_id, regions } = data;
  assert(username, '用户名不能为空');
  assert(password, '密码不能为空');
  assert(org_id, '机构ID不能为空');
  assert(regions && regions.length > 0, '地区不能为空');

  return await mysqlClient.prismaClient.$transaction(async tx => {
    const existUser = await tx.liveAdminUser.findFirst({
      where: {
        username,
      },
      select: { id: true },
    });

    assert(!existUser, '用户已存在，不能重复添加');

    const { org_id, regions, ...restData } = data;

    // Create user
    const user = await tx.liveAdminUser.create({
      data: {
        ...restData,
        org_id: BigInt(org_id),
      },
    });
    // 创建用户地区关系
    await tx.liveAdminUserRegionRelation.createMany({
      data: [...new Set(regions!)].map(region => ({
        user_id: user.id,
        region,
      })),
    });
    return { id: user.id.toString() };
  });
}

// Update TK Guild User
export async function updateTKGuildUser(
  data: UpdateTKGuildUserRequest & { org_id: string },
): Promise<void> {
  logger.info('[Update TK Guild User]', { data });

  const { id } = data.data;
  assert(id, '用户ID不能为空');

  const { org_id } = data;
  assert(org_id, '机构ID不能为空');

  await mysqlClient.prismaClient.$transaction(async tx => {
    // Check if user exists
    const existUser = await tx.liveAdminUser.findUnique({
      where: {
        id: BigInt(id),
        org_id: BigInt(org_id),
      },
      select: { id: true },
    });
    assert(existUser, '用户不存在');

    // eslint-disable-next-line ts/no-unused-vars
    const { id: _, regions, ...updateData } = data.data;

    // Apply XSS protection to string fields
    if (updateData.username) {
      updateData.username = xss(updateData.username);
    }

    // Update user
    await tx.liveAdminUser.update({
      where: {
        id: BigInt(id),
      },
      data: updateData,
    });

    if (regions?.length) {
      // Update user regions
      await tx.liveAdminUserRegionRelation.deleteMany({
        where: {
          user_id: BigInt(id),
        },
      });

      // Create new user regions
      await tx.liveAdminUserRegionRelation.createMany({
        data: [...new Set(regions!)].map(region => ({
          user_id: BigInt(id),
          region,
        })),
      });
    }
  });
}

// Delete TK Guild User
export async function deleteTKGuildUser(
  data: DeleteTKGuildUserRequest & { org_id: string },
): Promise<DeleteTKGuildUserResponse['data']> {
  logger.info('[Delete TK Guild User]', { data });
  assert(data.ids.length > 0, '用户ID不能为空');
  assert(data.org_id, '机构ID不能为空');

  return await mysqlClient.prismaClient.$transaction(async prisma => {
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
}

// Update TK Guild User Cookie
export async function updateTKGuildUserCookie(
  data: UpdateTKGuildUserCookieRequest & { org_id: string },
): Promise<void> {
  logger.info('[Update TK Guild User Cookie]', { data });

  const { id, cookie, org_id } = data;
  assert(id, '用户ID不能为空');
  assert(cookie, 'Cookie不能为空');
  assert(org_id, '机构ID不能为空');

  await mysqlClient.prismaClient.$transaction(async tx => {
    // Check if user exists
    const existUser = await tx.liveAdminUser.findUnique({
      where: {
        id: BigInt(id),
        org_id: BigInt(org_id),
      },
      select: { id: true },
    });

    assert(existUser, '用户不存在');

    await tx.liveAdminUser.update({
      where: {
        id: BigInt(id),
        org_id: BigInt(org_id),
      },
      data: {
        cookie,
        status: TKGuildUserStatus.WAITING,
      },
    });
  });
}
