import type {
  Area,
  OrgMemberLoginRequest,
  OrgMemberLoginResponseData,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { OrganizationStatus, OrgMemberStatus } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { simpleDecrypt } from '@tk-crawler/shared';
import dayjs from 'dayjs';
import config from '../../config';
import { logger } from '../../infra/logger';
import { BusinessError, generateToken, verifyPassword } from '../../utils';

export async function orgMemberLogin(
  request: OrgMemberLoginRequest,
): Promise<OrgMemberLoginResponseData> {
  logger.info('[Org Member Login]', request);
  assert(request.username, '用户名不能为空');
  assert(request.password, '密码不能为空');
  const user = await mysqlClient.prismaClient.orgUser.findUnique({
    where: {
      username: request.username,
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
  if (!user) {
    throw new BusinessError('用户不存在, 请重新登录');
  }
  if (user.status !== OrgMemberStatus.normal) {
    throw new BusinessError('用户已禁用, 请重新登录');
  }
  const { password, organization, ...rest } = user;
  const passwordDecrypted = simpleDecrypt(
    request.password,
    config.simplePasswordKey,
  );
  if (!(await verifyPassword(passwordDecrypted, password))) {
    throw new BusinessError('密码错误, 请重新登录');
  }
  if (!organization) {
    throw new BusinessError('所属组织不存在, 可能已被删除，请重新登录');
  }

  if (organization.status !== OrganizationStatus.normal) {
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
      ...organization,
      areas: organization.areas.map(item => item.area as Area),
      id: organization.id.toString(),
      if_membership_valid:
        Boolean(organization.membership_expire_at) &&
        dayjs(organization.membership_expire_at).isAfter(new Date()),
    },
    token,
  };
}
