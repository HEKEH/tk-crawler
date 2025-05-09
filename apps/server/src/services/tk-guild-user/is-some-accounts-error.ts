import {
  type IsAnyAccountErrorRequest,
  type IsAnyAccountErrorResponseData,
  TKGuildUserStatus,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../infra/logger';

export async function isAnyAccountError(
  data: IsAnyAccountErrorRequest & {
    org_id: string;
  },
): Promise<IsAnyAccountErrorResponseData> {
  const hasError = Boolean(
    await mysqlClient.prismaClient.liveAdminUser.findFirst({
      where: {
        org_id: BigInt(data.org_id),
        status: {
          in: [TKGuildUserStatus.ERROR, TKGuildUserStatus.COOKIE_EXPIRED],
        },
      },
    }),
  );
  logger.trace('[Is Any Account Error]', {
    org_id: data.org_id,
    hasError,
  });

  return {
    has_error: hasError,
  };
}
