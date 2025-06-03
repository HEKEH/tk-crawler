import type {
  GetAutoFollowMobileDeviceListResponseData,
  GetMobileDeviceListRequest,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { mysqlClient } from '@tk-crawler/database';

export async function getAutoFollowMobileDeviceList(
  request: GetMobileDeviceListRequest & { org_id: string; with_org?: boolean },
  logger: Logger,
): Promise<GetAutoFollowMobileDeviceListResponseData> {
  let { org_id, filter, order_by, page_num, page_size, with_org } = request;
  filter = {
    ...filter,
    org_id: BigInt(org_id),
  };
  const [mobileDeviceList, total] = await Promise.all([
    mysqlClient.prismaClient.mobileDevice.findMany({
      where: filter,
      orderBy: order_by,
      skip: (page_num - 1) * page_size,
      take: page_size,
      include: {
        organization: with_org,
      },
    }),
    mysqlClient.prismaClient.mobileDevice.count({
      where: filter,
    }),
  ]);
  logger.info(`[getMobileDeviceList response]: ${total} devices`);
  logger.trace(mobileDeviceList);
  return {
    list: mobileDeviceList.map(item => {
      return {
        id: item.id.toString(),
        device_id: item.device_id,
        device_name: item.device_name,
        created_at: item.created_at,
        updated_at: item.updated_at,
        organization: item.organization
          ? {
              ...item.organization,
              id: item.organization.id.toString(),
            }
          : undefined,
      };
    }),
    total,
  };
}
