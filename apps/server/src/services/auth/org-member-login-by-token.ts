import type {
  OrgMemberLoginByTokenRequest,
  OrgMemberLoginByTokenResponseData,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { OrganizationStatus, OrgMemberStatus } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import dayjs from 'dayjs';
import { logger } from '../../infra/logger';
import { BusinessError, parseToken } from '../../utils';

/** jwt token登录 */
export async function orgMemberLoginByToken(
  data: OrgMemberLoginByTokenRequest,
): Promise<OrgMemberLoginByTokenResponseData> {
  logger.info('[Org Member Login By Token]', data);
  assert(data?.token, 'Token不能为空');
  const { userId, expires } = parseToken(data.token);
  assert(userId && expires, 'Token无效，请重新登录');
  if (expires < Date.now()) {
    throw new BusinessError('Token已过期，请重新登录');
  }
  const user = await mysqlClient.prismaClient.orgUser.findFirst({
    where: {
      id: BigInt(userId),
    },
    omit: {
      password: true,
    },
  });
  if (!user) {
    throw new BusinessError('用户不存在, 请重新登录');
  }
  if (user.status !== OrgMemberStatus.normal) {
    throw new BusinessError('用户已禁用, 请重新登录');
  }
  const org = await mysqlClient.prismaClient.organization.findUnique({
    where: {
      id: user.org_id,
    },
  });
  if (!org) {
    throw new BusinessError('所属组织不存在，可能已被删除，请重新登录');
  }

  if (org.status !== OrganizationStatus.normal) {
    throw new BusinessError('所属组织已禁用, 请重新登录');
  }

  return {
    user_info: {
      ...user,
      id: user.id.toString(),
      org_id: user.org_id.toString(),
    },
    org_info: {
      ...org,
      id: org.id.toString(),
      if_membership_valid:
        Boolean(org.membership_expire_at) &&
        dayjs(org.membership_expire_at).isAfter(new Date()),
    },
  };
}
