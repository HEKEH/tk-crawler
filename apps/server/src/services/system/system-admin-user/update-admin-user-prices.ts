import type { UpdateSystemAdminUserPricesRequest } from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { BusinessError } from '../../../utils';
import { updateSystemAdminUser } from './update-admin-user';

export async function updateSystemAdminUserPrices(
  { data }: UpdateSystemAdminUserPricesRequest,
  logger: Logger,
): Promise<void> {
  logger.info('[Update System Admin User Prices]', { data });
  if (
    !(
      typeof data.base_price === 'number' &&
      data.base_price > 0 &&
      typeof data.follow_price === 'number' &&
      data.follow_price > 0
    )
  ) {
    throw new BusinessError('非法价格值');
  }
  return await updateSystemAdminUser(
    {
      data: {
        id: data.id,
        base_price: data.base_price,
        follow_price: data.follow_price,
      },
    },
    logger,
  );
}
