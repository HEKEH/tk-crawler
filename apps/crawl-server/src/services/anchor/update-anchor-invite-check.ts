import type { Area } from '@tk-crawler/biz-shared';
import type { CanUseInvitationType } from '@tk-crawler/tk-requests';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database/mysql';
import { beautifyJsonStringify } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';

interface UpdateAnchorInviteCheckData {
  anchor_id: string;
  org_id: string;
  checked_by: string;
  /** true 代表可邀约，false 代表不可邀约 */
  checked_result: boolean;
  invite_type: CanUseInvitationType | null;
  checked_at: Date;
  area: Area;
}

export async function batchUpdateAnchorInviteCheck(
  dataArray: UpdateAnchorInviteCheckData[],
) {
  assert(dataArray.length > 0, 'dataArray must not be empty');
  logger.info(
    `[anchor] batch update anchor invite check: ${beautifyJsonStringify(dataArray)}`,
  );
  // 构建批量插入语句参数
  const values = dataArray.map(data => {
    const {
      anchor_id,
      org_id,
      checked_by,
      checked_result,
      invite_type,
      checked_at,
      area,
    } = data;

    assert(anchor_id !== undefined, 'anchor_id is required');
    assert(org_id !== undefined, 'org_id is required');
    assert(checked_result !== undefined, 'checked_result is required');
    assert(invite_type !== undefined, 'invite_type is required');
    assert(area !== undefined, 'area is required');

    return [
      BigInt(anchor_id),
      BigInt(org_id),
      BigInt(checked_by),
      checked_result ? 1 : 0,
      invite_type,
      checked_at,
      area,
    ];
  });

  // 构建 SQL 参数占位符
  const placeholders = values
    .map(() => '(?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3))')
    .join(', ');

  // 展平数组用于 SQL 参数
  const flatParams = values.flat();

  // 执行 MySQL 的 INSERT ... ON DUPLICATE KEY UPDATE 语句
  const sql = `
    INSERT INTO AnchorInviteCheck
    (anchor_id, org_id, checked_by, checked_result, invite_type, checked_at, area, updated_at)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
    checked_by = VALUES(checked_by),
    checked_result = VALUES(checked_result),
    invite_type = VALUES(invite_type),
    checked_at = VALUES(checked_at),
    area = VALUES(area),
    updated_at = CURRENT_TIMESTAMP(3)
  `;

  return await mysqlClient.prismaClient.$executeRawUnsafe(sql, ...flatParams);
}
