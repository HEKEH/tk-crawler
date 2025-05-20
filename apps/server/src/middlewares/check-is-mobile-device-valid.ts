import type { Context, Next } from 'koa';
import { BusinessError } from '../utils';

export async function checkIsMobileDeviceValid(ctx: Context, next: Next) {
  const { org_info, device_id: token_device_id } = ctx.clientInfo!;
  if (!token_device_id) {
    throw new BusinessError('参数缺失');
  }
  if (!org_info.mobile_devices?.length) {
    throw new BusinessError('参数缺失');
  }
  const orgDeviceIds = org_info.mobile_devices.map(item => item.device_id);
  if (!orgDeviceIds.includes(token_device_id)) {
    throw new BusinessError('设备不匹配');
  }
  await next();
}
