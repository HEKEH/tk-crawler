import type { Logger } from '@tk-crawler/shared';
import {
  type IsAnyGuildAccountErrorRequest,
  type IsAnyGuildAccountErrorResponseData,
  TKGuildUserStatus,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';

export async function isAnyGuildAccountError(
  data: IsAnyGuildAccountErrorRequest & {
    org_id?: string;
  },
  logger: Logger,
): Promise<IsAnyGuildAccountErrorResponseData> {
  const hasError = Boolean(
    await mysqlClient.prismaClient.liveAdminUser.findFirst({
      where: {
        ...data.filter,
        org_id: data.org_id ? BigInt(data.org_id) : undefined,
        status: {
          in: [TKGuildUserStatus.ERROR, TKGuildUserStatus.COOKIE_EXPIRED],
        },
      },
      select: {
        id: true,
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
