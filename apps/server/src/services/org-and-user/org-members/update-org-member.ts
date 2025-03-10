import type { UpdateOrgMemberRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { BusinessError, hashPassword } from '../../../utils';

export async function updateOrgMember(
  data: UpdateOrgMemberRequest,
): Promise<void> {
  const { password, id, ...rest } = data;
  const usernameFind = await mysqlClient.prismaClient.orgUser.findFirst({
    where: { username: rest.username, id: { not: BigInt(id) } },
  });
  if (usernameFind) {
    throw new BusinessError('登录名已存在');
  }
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
