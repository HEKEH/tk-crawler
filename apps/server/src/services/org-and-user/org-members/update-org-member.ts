import type { UpdateOrgMemberRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { hashPassword } from '../../../utils';

export async function updateOrgMember(
  data: UpdateOrgMemberRequest,
): Promise<void> {
  const { password, id, ...rest } = data;
  let updateData;
  if (password) {
    const hashedPassword = await hashPassword(password);
    updateData = { ...rest, password: hashedPassword };
    logger.info('[Update Org Member]', {
      data: { ...data, password: '******' },
    });
  } else {
    updateData = rest;
    logger.info('[Update Org Member]', { data });
  }
  await mysqlClient.prismaClient.orgUser.update({
    where: {
      id: BigInt(id),
    },
    data: updateData,
  });
}
