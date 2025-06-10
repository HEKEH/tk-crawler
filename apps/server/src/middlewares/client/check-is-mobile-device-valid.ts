import type { Context, Next } from 'koa';
import { BusinessError } from '../../utils';

export async function checkIsMobileDeviceValid(ctx: Context, next: Next) {
  const { org_info, device_id: token_device_id } = ctx.clientInfo!;
  if (!token_device_id) {
    throw new BusinessError('参数缺失');
  }
  if (!org_info.mobile_devices?.length) {
    throw new BusinessError('参数缺失');
  }
  if (org_info.mobile_devices.length > org_info.mobile_device_limit) {
    throw new BusinessError(
      '设备数量已超上限，请购买设备配额或联系供应商解绑部分设备',
    );
  }
  const orgDeviceIds = org_info.mobile_devices.map(item => item.device_id);
  if (!orgDeviceIds.includes(token_device_id)) {
    throw new BusinessError('设备不匹配');
  }
  await next();
}
