import type { UpdateOrgMemberRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { BusinessError, hashPassword } from '../../../utils';

export async function updateOrgMember({
  org_id,
  data,
}: UpdateOrgMemberRequest): Promise<void> {
  const { password, id, ...rest } = data;
  if (rest.username) {
    const usernameFind = await mysqlClient.prismaClient.orgUser.findFirst({
      select: { id: true },
      where: { username: rest.username, id: { not: BigInt(id) } },
    });
    if (usernameFind) {
      throw new BusinessError('登录名已存在');
    }
  }
  const user = await mysqlClient.prismaClient.orgUser.findUnique({
    where: { id: BigInt(id) },
  });
  if (!user) {
    throw new BusinessError('用户不存在');
  }
  if (user.org_id.toString() !== org_id) {
    throw new BusinessError('用户不属于该组织');
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
