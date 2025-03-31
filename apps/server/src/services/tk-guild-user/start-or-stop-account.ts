import type {
  StartTKLiveAdminAccountRequest,
  StopTKLiveAdminAccountRequest,

  UpdateTKGuildUserCookieRequest } from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import {
  TKGuildUserStatus,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../infra/logger';
import { BusinessError } from '../../utils';

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

export async function startLiveAdminAccount(
  data: StartTKLiveAdminAccountRequest & { org_id: string },
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
    [
      TKGuildUserStatus.RUNNING,
      TKGuildUserStatus.WAITING,
      TKGuildUserStatus.WARNING,
    ].includes(user.status)
  ) {
    throw new BusinessError('用户已启动');
  }

  await mysqlClient.prismaClient.$transaction(async tx => {
    await tx.liveAdminUser.update({
      where: {
        id: BigInt(user_id),
      },
      data: { status: TKGuildUserStatus.WAITING },
    });
    // TODO: 启动用户
  });
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
    [
      TKGuildUserStatus.INACTIVE,
      TKGuildUserStatus.STOPPED,
      TKGuildUserStatus.ERROR,
    ].includes(user.status)
  ) {
    throw new BusinessError('用户已停止');
  }

  await mysqlClient.prismaClient.$transaction(async tx => {
    await tx.liveAdminUser.update({
      where: {
        id: BigInt(user_id),
      },
      data: { status: TKGuildUserStatus.STOPPED },
    });
    // TODO: 停止用户
  });
}
