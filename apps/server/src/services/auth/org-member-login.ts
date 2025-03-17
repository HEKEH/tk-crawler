import assert from 'node:assert';
import {
  OrganizationStatus,
  type OrgMemberLoginRequest,
  type OrgMemberLoginResponseData,
  OrgMemberStatus,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import dayjs from 'dayjs';
import { logger } from '../../infra/logger';
import { BusinessError, generateToken, verifyPassword } from '../../utils';

export async function orgMemberLogin(
  data: OrgMemberLoginRequest,
): Promise<OrgMemberLoginResponseData> {
  logger.info('[Org Member Login]', data);
  assert(data.username, '用户名不能为空');
  assert(data.password, '密码不能为空');
  const user = await mysqlClient.prismaClient.orgUser.findFirst({
    where: {
      username: data.username,
    },
  });
  if (!user) {
    throw new BusinessError('用户不存在, 请重新登录');
  }
  if (user.status !== OrgMemberStatus.normal) {
    throw new BusinessError('用户已禁用, 请重新登录');
  }
  const { password, ...rest } = user;
  if (!(await verifyPassword(data.password, password))) {
    throw new BusinessError('密码错误, 请重新登录');
  }
  const org = await mysqlClient.prismaClient.organization.findUnique({
    where: {
      id: user.org_id,
    },
  });
  if (!org) {
    throw new BusinessError('所属组织不存在, 可能已被删除，请重新登录');
  }

  if (org.status !== OrganizationStatus.normal) {
    throw new BusinessError('所属组织已禁用, 请重新登录');
  }

  const token = await generateToken(user.id.toString());
  return {
    user_info: {
      ...rest,
      id: rest.id.toString(),
      org_id: rest.org_id.toString(),
    },
    org_info: {
      ...org,
      id: org.id.toString(),
      if_membership_valid:
        Boolean(org.membership_expire_at) &&
        dayjs(org.membership_expire_at).isAfter(new Date()),
    },
    token,
  };
}
