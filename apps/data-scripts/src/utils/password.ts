import {
  hashPassword as hashPasswordShared,
  verifyPassword as verifyPasswordShared,
} from '@tk-crawler/server-shared';
import { logger } from '../infra/logger';

// 加密密码
export async function hashPassword(password: string): Promise<string> {
  return hashPasswordShared(password, logger);
}

// 验证密码
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return verifyPasswordShared(password, hash, logger);
}
