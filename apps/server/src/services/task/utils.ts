import { mysqlClient } from '@tk-crawler/database';
import { BusinessError } from '../../utils';

export async function validateAnchorCheckIds(
  anchorCheckIds: bigint[],
  orgId: bigint,
) {
  const anchorNotInOrg =
    await mysqlClient.prismaClient.anchorInviteCheck.findFirst({
      where: {
        id: {
          in: anchorCheckIds,
        },
        org_id: {
          not: orgId,
        },
      },
      select: {
        id: true,
      },
    });
  if (anchorNotInOrg) {
    throw new BusinessError('异常请求，试图操作不属于机构的数据');
  }
}
