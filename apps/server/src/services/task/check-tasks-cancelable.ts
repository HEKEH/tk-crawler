import { mysqlClient } from '@tk-crawler/database';
import { BusinessError } from '../../utils';

export async function checkTasksCancelable(data: {
  anchor_check_ids: string[];
  org_member_id: string;
}) {
  const anchorCheckIds = data.anchor_check_ids.map(id => BigInt(id));
  const orgMemberId = BigInt(data.org_member_id);
  const abnormalAnchor =
    await mysqlClient.prismaClient.anchorInviteCheck.findFirst({
      where: {
        id: {
          in: anchorCheckIds,
        },
        assign_to: {
          not: orgMemberId,
        },
      },
    });
  if (abnormalAnchor) {
    throw new BusinessError('部分任务已分配给其他用户，无法取消');
  }
}
