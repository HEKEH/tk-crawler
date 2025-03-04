import type { UpdateAnchorRequest } from '@tk-crawler/biz-shared';
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
    // 因为查询较为复杂，所以使用原生sql
    const {
      user_id,
      display_id,
      room_id,
      region,
      follower_count,
      audience_count,
      level,
      current_diamonds,
      rank_league,
      has_commerce_goods,
      tag,
    } = data;
    const sql = Prisma.sql`
      INSERT INTO Anchor (
        user_id,
        display_id,
        room_id,
        region,
        follower_count,
        audience_count,
        level,
        current_diamonds,
        rank_league,
        has_commerce_goods,
        tag,
        highest_diamonds,
        updated_at
      )
      VALUES (
        ${user_id},
        ${display_id},
        ${room_id},
        ${region},
        ${follower_count},
        ${audience_count},
        ${level},
        ${current_diamonds},
        ${rank_league},
        ${has_commerce_goods},
        ${tag},
        ${current_diamonds},
        CURRENT_TIMESTAMP(3)
      )
      ON DUPLICATE KEY UPDATE
        display_id = ${display_id},
        room_id = ${room_id},
        region = ${region},
        follower_count = ${follower_count},
        audience_count = ${audience_count},
        level = ${level},
        -- 因为current_diamonds的计算方式是有问题的，总是会小于或等于真实的钻石数，所以如果之前的current_diamonds较大，则不更新
        current_diamonds = IF(room_id != ${room_id}, ${current_diamonds}, GREATEST(${current_diamonds}, current_diamonds)),
        -- 如果房间id发生变化，则更新last_diamonds
        last_diamonds = IF(room_id != ${room_id}, current_diamonds, last_diamonds),
        highest_diamonds = GREATEST(${current_diamonds}, highest_diamonds),
        rank_league = ${rank_league},
        has_commerce_goods = ${has_commerce_goods},
        tag = ${tag},
        updated_at = CURRENT_TIMESTAMP(3)
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
