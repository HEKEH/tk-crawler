import type { AddSystemAdminUserBalanceRequest } from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { mysqlClient } from '@tk-crawler/database';
import { BusinessError } from '../../../utils';

export async function addSystemAdminUserBalance(
  { data }: AddSystemAdminUserBalanceRequest,
  logger: Logger,
): Promise<void> {
  logger.info('[Add System Admin User Balance]', { data });
  await mysqlClient.prismaClient.$transaction(async tx => {
    // Use SELECT FOR UPDATE to lock the row
    const users = await tx.$queryRaw<
      {
        id: bigint;
        balance: number;
      }[]
    >`
      SELECT id, balance
      FROM SystemAdminUser
      WHERE id = ${BigInt(data.id)}
      FOR UPDATE
    `;
    const user = users[0];
    if (!user) {
      throw new BusinessError('未找到该用户');
    }
    if (data.amount < 0 && user.balance + data.amount < 0) {
      throw new BusinessError('余额不足');
    }
    await tx.systemAdminUser.update({
      where: { id: BigInt(data.id) },
      data: { balance: { increment: data.amount } },
    });
  });
}
