import type { UpdateAnchorRequest } from '@tk-crawler/shared';
import process from 'node:process';
import { Prisma, PrismaClient } from '@prisma/client';
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

  async updateAnchor(data: UpdateAnchorRequest) {
    const {
      user_id,
      display_id,
      region,
      follower_count,
      audience_count,
      level,
      current_diamond,
      rank_league,
      has_commerce_goods,
      tag,
    } = data;
    const sql = Prisma.sql`
      INSERT INTO Anchor (
        user_id,
        display_id,
        region,
        follower_count,
        audience_count,
        level,
        current_diamond,
        rank_league,
        has_commerce_goods,
        tag,
        highest_diamond,
        updated_at
      )
      VALUES (
        ${user_id},
        ${display_id},
        ${region},
        ${follower_count},
        ${audience_count},
        ${level},
        ${current_diamond},
        ${rank_league},
        ${has_commerce_goods},
        ${tag},
        ${current_diamond},
        CURRENT_TIMESTAMP(0)
      )
      ON DUPLICATE KEY UPDATE
        highest_diamond = GREATEST(${current_diamond}, COALESCE(highest_diamond, 0)),
        last_diamond = current_diamond,
        user_id = ${user_id},
        display_id = ${display_id},
        region = ${region},
        follower_count = ${follower_count},
        audience_count = ${audience_count},
        level = ${level},
        current_diamond = ${current_diamond},
        rank_league = ${rank_league},
        has_commerce_goods = ${has_commerce_goods},
        tag = ${tag},
        updated_at = CURRENT_TIMESTAMP(0)
    `;
    await this.prismaClient.$executeRaw(sql);
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
