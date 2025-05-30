import type {
  Area,
  MobileOrgMemberLoginRequest,
  MobileOrgMemberLoginResponse,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import { logger } from '../../infra/logger';
import { BusinessError, generateToken } from '../../utils';
import { getOrgMemberInfoByLogin } from '../auth';

export async function mobileOrgMemberLogin(
  _request: MobileOrgMemberLoginRequest,
): Promise<MobileOrgMemberLoginResponse['data']> {
  const request = {
    ..._request,
    username: _request.username?.trim(),
  };
  logger.info('[Mobile Org Member Login]', request);
  assert(request.username, '用户名不能为空');
  assert(request.password, '密码不能为空');
  assert(request.device_id, '设备ID不能为空');
  assert(request.device_name, '设备名称不能为空');
  const user = await getOrgMemberInfoByLogin(request, {
    not_decrypt_password: true,
    include_mobile_devices: true,
  });
  const { organization, ...rest } = user;

  const ifMembershipValid =
    Boolean(organization.membership_expire_at) &&
    dayjs(organization.membership_expire_at).isAfter(new Date());
  if (!ifMembershipValid) {
    throw new BusinessError('所属机构无会员资格或会员已过期');
  }

  const mobileDevices = organization.mobile_devices;
  if (mobileDevices.every(item => item.device_id !== request.device_id)) {
    if (mobileDevices.length >= organization.mobile_device_limit) {
      throw new BusinessError('设备数量已达上限');
    }
    await mysqlClient.prismaClient.mobileDevice.create({
      data: {
        device_id: request.device_id,
        device_name: request.device_name,
        org_id: organization.id,
      },
    });
  }

  const token = await generateToken({
    userId: user.id.toString(),
    deviceId: request.device_id,
  });
  return {
    user_info: {
      ...omit(rest, 'password'),
      id: rest.id.toString(),
      org_id: rest.org_id.toString(),
    },
    org_info: {
      ...omit(organization, 'mobile_devices'),
      areas: organization.areas.map(item => item.area as Area),
      id: organization.id.toString(),
      if_membership_valid: ifMembershipValid,
    },
    token,
  };
}
