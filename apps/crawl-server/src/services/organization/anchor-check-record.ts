import { redisClient, RedisNamespace } from '@tk-crawler/database';
import { ANCHOR_CHECK_OUTDATE_TIME } from '../../constants';

export const checkAnchorRecordRedisNamespace = new RedisNamespace(
  redisClient,
  'c-a-b-o', // check anchor by org
);

function getKey(orgId: string, anchorId: string) {
  return `${orgId}-${anchorId}`;
}

// 检测是否最近被机构检测过
export async function isAnchorRecentlyCheckedByOrg(data: {
  anchorId: string;
  orgId: string;
}) {
  return Boolean(
    await checkAnchorRecordRedisNamespace.get(
      getKey(data.orgId, data.anchorId),
    ),
  );
}

/** 批量检测是否最近被机构检测过，返回false的anchor_id最近没有被检测过，可以检测 */
export async function batchIsAnchorRecentlyCheckedByOrg({
  anchorIds,
  orgId,
}: {
  anchorIds: string[];
  orgId: string;
}): Promise<Record<string, boolean>> {
  const records = await checkAnchorRecordRedisNamespace.mget(
    anchorIds.map(anchorId => getKey(orgId, anchorId)),
  );
  const res: Record<string, boolean> = {};
  anchorIds.forEach((anchor_id, index) => {
    const record = records[index];
    // 如果记录存在，则认为不需要再检测过
    res[anchor_id] = Boolean(record);
  });
  return res;
}
export async function recordAnchorCheckByOrg(data: {
  anchorIds: string[];
  orgId: string;
}) {
  await checkAnchorRecordRedisNamespace.mset(
    data.anchorIds.map(anchorId => [getKey(data.orgId, anchorId), 1]),
    ANCHOR_CHECK_OUTDATE_TIME,
  );
}

export async function clearAnchorCheckRecordByOrg(data: { orgId: string }) {
  await checkAnchorRecordRedisNamespace.delByPrefix(`${data.orgId}-`);
}
