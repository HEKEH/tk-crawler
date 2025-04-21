import type { Logger } from '@tk-crawler/shared';
import assert from 'node:assert';
import { validatePassword } from '@tk-crawler/biz-shared';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // 推荐的轮数，根据安全需求和性能平衡

// 加密密码
export async function hashPassword(
  password: string,
  logger?: Logger,
): Promise<string> {
  try {
    // 验证密码强度
    const validation = validatePassword(password);
    assert(validation.isValid, validation.error);

    // 使用固定的salt轮数
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  } catch (error) {
    // 记录错误但不暴露详细信息
    logger?.error('[Password hashing failed]', error);
    throw new Error('密码处理失败');
  }
}

// 验证密码
export async function verifyPassword(
  password: string,
  hash: string,
  logger?: Logger,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger?.error('[Password verification failed]', error);
    throw new Error('密码验证失败');
  }
}
