import type { UpdateSystemAdminUserDiscountRequest } from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { BusinessError } from '../../../utils';
import { updateSystemAdminUser } from './update-admin-user';

export async function updateSystemAdminUserDiscount(
  { data }: UpdateSystemAdminUserDiscountRequest,
  logger: Logger,
): Promise<void> {
  logger.info('[Update System Admin User Discount]', { data });
  if (!(typeof data.discount === 'number' && data.discount >= 0.1)) {
    throw new BusinessError('非法折扣值');
  }
  return await updateSystemAdminUser(
    { data: { id: data.id, discount: data.discount } },
    logger,
  );
}
