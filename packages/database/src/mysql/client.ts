import process from 'node:process';
import { PrismaClient } from '@prisma/client';
import { getLogger } from '../infra';
import { loadMysqlEnvironment } from './environment';

export class MysqlClient {
  private static _instance: MysqlClient | undefined;
  private _prismaClient: PrismaClient | undefined;
  get prismaClient() {
    if (!this._prismaClient) {
      throw new Error('MysqlClient is not initialized');
    }
    return this._prismaClient;
  }

  private constructor() {}

  static getInstance() {
    if (!MysqlClient._instance) {
      MysqlClient._instance = new MysqlClient();
    }
    return MysqlClient._instance;
  }

  async connect() {
    const startTime = Date.now();
    const logger = getLogger();
    logger.info('[MySQL] Connecting to database...');

    try {
      loadMysqlEnvironment();
      this._prismaClient = new PrismaClient({
        log:
          process.env.NODE_ENV === 'production'
            ? ['error']
            : ['query', 'info', 'warn', 'error'],
      });

      await this._prismaClient.$connect();

      const duration = Date.now() - startTime;
      logger.info(`[MySQL] Successfully connected to database (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        `[MySQL] Failed to connect to database (${duration}ms):`,
        error,
      );
      throw error; // 重新抛出错误以便上层处理
    }
  }

  async disconnect() {
    await this.prismaClient.$disconnect();
  }
}

export const mysqlClient = MysqlClient.getInstance();
