import type { DeleteMobileDeviceRequest } from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { BusinessError } from '../../utils';

export async function deleteMobileDevice(
  request: DeleteMobileDeviceRequest,
  logger: Logger,
): Promise<void> {
  const { org_id, id } = request;
  assert(org_id, 'org_id is required');
  assert(id, 'id is required');
  const device = await mysqlClient.prismaClient.mobileDevice.findUnique({
    where: {
      id: BigInt(id),
      org_id: BigInt(org_id),
    },
  });

  if (!device) {
    throw new BusinessError('设备不存在');
  }
  await mysqlClient.prismaClient.mobileDevice.delete({
    where: {
      id: BigInt(id),
    },
  });
  logger.info(`[deleteMobileDevice response]: ${id}`);
}
