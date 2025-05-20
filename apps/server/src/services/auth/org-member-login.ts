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
import { omit } from 'lodash';
import config from '../../config';
import { BusinessError, generateToken, verifyPassword } from '../../utils';

export async function getOrgMemberInfoByLogin(
  request: OrgMemberLoginRequest,
  options?: {
    /** 是否包含移动设备 */
    include_mobile_devices?: boolean;
    /** 是否不解密密码 */
    not_decrypt_password?: boolean;
  },
) {
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
          mobile_devices: options?.include_mobile_devices
            ? {
                select: {
                  device_id: true,
                },
              }
            : undefined,
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
  const { password, organization } = user;
  const passwordDecrypted = options?.not_decrypt_password
    ? request.password
    : simpleDecrypt(request.password, config.simplePasswordKey);
  if (!(await verifyPassword(passwordDecrypted, password))) {
    throw new BusinessError('密码错误, 请重新登录');
  }
  if (!organization) {
    throw new BusinessError('所属组织不存在, 可能已被删除，请重新登录');
  }

  if (organization.status !== OrganizationStatus.normal) {
    throw new BusinessError('所属组织已禁用, 请重新登录');
  }
  return user;
}

export async function orgMemberLogin(
  _request: OrgMemberLoginRequest,
): Promise<OrgMemberLoginResponseData> {
  const request = {
    ..._request,
    username: _request.username?.trim(),
  };
  assert(request.username, '用户名不能为空');
  assert(request.password, '密码不能为空');
  const user = await getOrgMemberInfoByLogin(request);
  const { organization, ...rest } = user;

  const token = await generateToken({
    userId: user.id.toString(),
  });
  return {
    user_info: {
      ...omit(rest, 'password'),
      id: rest.id.toString(),
      org_id: rest.org_id.toString(),
    },
    org_info: {
      ...organization,
      mobile_devices: organization.mobile_devices?.map(item => ({
        ...item,
        id: item.device_id.toString(),
        device_id: item.device_id.toString(),
      })),
      areas: organization.areas.map(item => item.area as Area),
      id: organization.id.toString(),
      if_membership_valid:
        Boolean(organization.membership_expire_at) &&
        dayjs(organization.membership_expire_at).isAfter(new Date()),
    },
    token,
  };
}
