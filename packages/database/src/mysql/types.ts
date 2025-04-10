import type { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

export type PrismaClientTransactionContext = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
