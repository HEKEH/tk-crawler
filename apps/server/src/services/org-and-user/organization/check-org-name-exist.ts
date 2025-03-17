import { mysqlClient } from '@tk-crawler/database';

export async function checkOrgNameExist(orgName: string): Promise<boolean> {
  const org = await mysqlClient.prismaClient.organization.findFirst({
    select: { id: true },
    where: { name: orgName },
  });
  return Boolean(org);
}
