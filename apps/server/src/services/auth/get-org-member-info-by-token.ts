import type {
  Area,
  OrgMemberUserInfoWithOrgInfo,
} from '@tk-crawler/biz-shared';
import { OrganizationStatus, OrgMemberStatus } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import dayjs from 'dayjs';
import { BusinessError, parseToken, TokenInvalidError } from '../../utils';

/** jwt token登录 */
export async function getOrgMemberInfoByToken(
  token: string | any | undefined,
  options?: {
    fetchPassword?: boolean;
  },
): Promise<OrgMemberUserInfoWithOrgInfo> {
  if (!token) {
    throw new BusinessError('Token不能为空');
  }
  if (typeof token !== 'string') {
    throw new BusinessError('Token必须为字符串');
  }
  const { userId, expires } = parseToken(token);
  if (!userId || !expires) {
    throw new TokenInvalidError('Token无效，请重新登录');
  }
  if (expires < Date.now()) {
    throw new TokenInvalidError('Token已过期，请重新登录');
  }
  const user = await mysqlClient.prismaClient.orgUser.findFirst({
    where: {
      id: BigInt(userId),
    },
    omit: {
      password: !options?.fetchPassword,
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
    throw new TokenInvalidError('用户不存在, 请重新登录');
  }
  if (user.status !== OrgMemberStatus.normal) {
    throw new TokenInvalidError('用户已禁用, 请重新登录');
  }
  const { organization: org, ...userRest } = user;
  if (!org) {
    throw new TokenInvalidError('所属组织不存在，可能已被删除，请重新登录');
  }

  if (org.status !== OrganizationStatus.normal) {
    throw new TokenInvalidError('所属组织已禁用, 请重新登录');
  }

  const orgAreas = org.areas.map(item => item.area as Area);

  return {
    user_info: {
      ...userRest,
      id: userRest.id.toString(),
      org_id: userRest.org_id.toString(),
    },
    org_info: {
      ...org,
      areas: orgAreas,
      id: org.id.toString(),
      if_membership_valid:
        Boolean(org.membership_expire_at) &&
        dayjs(org.membership_expire_at).isAfter(new Date()),
    },
  };
}
