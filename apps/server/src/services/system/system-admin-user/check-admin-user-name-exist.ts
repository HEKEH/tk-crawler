import { mysqlClient } from '@tk-crawler/database';

export async function checkAdminUserNameExist(
  username: string,
): Promise<boolean> {
  const user = await mysqlClient.prismaClient.systemAdminUser.findUnique({
    select: { id: true },
    where: { username },
  });
  return Boolean(user);
}
