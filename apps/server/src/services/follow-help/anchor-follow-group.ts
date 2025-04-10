import type {
  BatchAddToAnchorFollowGroupRequest,
  ClearAnchorFollowGroupRequest,
  ClearAnchorFollowGroupResponse,
  CreateAnchorFollowGroupRequest,
  DeleteAnchorFollowGroupRequest,
  DeleteAnchorFollowGroupResponse,
  GetAnchorFollowGroupListRequest,
  GetAnchorFollowGroupListResponseData,
  GetAnchorFollowGroupRequest,
  GetAnchorFollowGroupResponse,
  GetAnchorFollowGroupWithAnchorIdsRequest,
  GetAnchorFollowGroupWithAnchorIdsResponse,
  UpdateAnchorFollowGroupRequest,
} from '@tk-crawler/biz-shared';
import type {
  PrismaClient,
  PrismaClientTransactionContext,
} from '@tk-crawler/database';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty, transObjectValuesToString, xss } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import { transformGroupFilterValuesToFilterValues } from './filter';

// 获取列表
export async function getAnchorFollowGroupList(
  data: GetAnchorFollowGroupListRequest,
): Promise<GetAnchorFollowGroupListResponseData> {
  logger.info('[Get Anchor Follow Group List]', { data });
  assert(data.org_id, '机构ID不能为空');
  const _orderBy = isEmpty(data.order_by)
    ? {
        updated_at: 'desc' as const, // 默认按更新时间倒序排序
      }
    : data.order_by!;

  const { anchors_count, ...orderBy } = _orderBy;
  if (anchors_count) {
    orderBy.AnchorFollowGroupRelation = {
      _count: anchors_count,
    };
  }
  const filter = transformGroupFilterValuesToFilterValues(
    data.filter,
    data.org_id,
  );
  const [groups, total] = await Promise.all([
    mysqlClient.prismaClient.anchorFollowGroup.findMany({
      where: filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
      include: {
        _count: {
          select: {
            AnchorFollowGroupRelation: true,
          },
        },
      },
    }),
    mysqlClient.prismaClient.anchorFollowGroup.count({
      where: filter,
    }),
  ]);

  return {
    list: groups.map(({ _count, ...group }) => ({
      ...group,
      id: group.id.toString(),
      org_id: group.org_id.toString(),
      anchors_count: _count.AnchorFollowGroupRelation,
    })),
    total,
  };
}

// 获取单个分组
export async function getAnchorFollowGroup(
  data: GetAnchorFollowGroupRequest,
): Promise<GetAnchorFollowGroupResponse['data']> {
  logger.info('[Get Anchor Follow Group]', { data });
  assert(data.org_id, '机构ID不能为空');

  const group = await mysqlClient.prismaClient.anchorFollowGroup.findUnique({
    where: { id: BigInt(data.id), org_id: BigInt(data.org_id) },
    include: {
      AnchorFollowGroupRelation: {
        include: {
          AnchorFrom87: true,
        },
      },
    },
  });

  assert(group, '未找到主播分组');

  const { AnchorFollowGroupRelation, ...rest } = group;

  return transObjectValuesToString(
    {
      ...rest,
      anchors: AnchorFollowGroupRelation.map(relation =>
        transObjectValuesToString(relation.AnchorFrom87, [
          'account_id',
          'id',
          'org_id',
        ]),
      ),
    },
    ['id', 'org_id'],
  );
}

// 获取带主播IDs的分组
export async function getAnchorFollowGroupWithAnchorIds(
  data: GetAnchorFollowGroupWithAnchorIdsRequest,
): Promise<GetAnchorFollowGroupWithAnchorIdsResponse['data']> {
  logger.info('[Get Anchor Follow Group With Anchor Ids]', { data });
  assert(data.org_id, '机构ID不能为空');

  const group = await mysqlClient.prismaClient.anchorFollowGroup.findUnique({
    where: { id: BigInt(data.id), org_id: BigInt(data.org_id) },
    include: {
      AnchorFollowGroupRelation: {
        include: {
          AnchorFrom87: {
            select: {
              account_id: true,
            },
          },
        },
      },
    },
  });

  assert(group, '未找到主播分组');

  const { AnchorFollowGroupRelation, ...rest } = group;

  return {
    ...transObjectValuesToString(rest, ['id', 'org_id']),
    anchor_ids: AnchorFollowGroupRelation.map(relation =>
      relation.AnchorFrom87.account_id.toString(),
    ),
  };
}

// 创建分组
export async function createAnchorFollowGroup(
  data: CreateAnchorFollowGroupRequest,
): Promise<{ id: string }> {
  logger.info('[Create Anchor Follow Group]', { data });

  const { anchor_table_ids, org_id, name } = data;

  assert(org_id, '机构ID不能为空');

  return await mysqlClient.prismaClient.$transaction(async tx => {
    const existGroup = await tx.anchorFollowGroup.findFirst({
      where: { name, org_id: BigInt(org_id) },
      select: { id: true },
    });
    assert(!existGroup, '分组名称已存在');

    // 创建分组
    const group = await tx.anchorFollowGroup.create({
      data: {
        name: xss(name),
        org_id: BigInt(org_id),
      },
    });

    // 创建关联关系
    if (anchor_table_ids?.length) {
      await tx.anchorFollowGroupRelation.createMany({
        data: anchor_table_ids.map(anchor_table_id => ({
          group_id: group.id,
          anchor_table_id: BigInt(anchor_table_id),
        })),
        skipDuplicates: true,
      });
    }

    return { id: group.id.toString() };
  });
}

/** 批量加入分组 */
export async function batchAddToAnchorFollowGroup(
  data: BatchAddToAnchorFollowGroupRequest,
): Promise<void> {
  logger.info('[Batch Add To Anchor Follow Group]', { data });

  const { anchor_table_ids, org_id, group_id } = data;

  assert(org_id, '机构ID不能为空');

  assert(anchor_table_ids?.length, '主播ID不能为空');

  return await mysqlClient.prismaClient.$transaction(async tx => {
    const existGroup = await tx.anchorFollowGroup.findFirst({
      where: { id: BigInt(group_id), org_id: BigInt(org_id) },
      select: { id: true },
    });
    assert(existGroup, '分组不存在');

    // 创建关联关系
    await tx.anchorFollowGroupRelation.createMany({
      data: anchor_table_ids.map(anchor_table_id => ({
        group_id: BigInt(group_id),
        anchor_table_id: BigInt(anchor_table_id),
      })),
      skipDuplicates: true,
    });
  });
}

// 更新分组
export async function updateAnchorFollowGroup(
  data: UpdateAnchorFollowGroupRequest,
): Promise<void> {
  logger.info('[Update Anchor Follow Group]', { data });

  const { id, org_id, added_anchor_table_ids, removed_anchor_table_ids, name } =
    data;
  assert(org_id, '机构ID不能为空');

  await mysqlClient.prismaClient.$transaction(async tx => {
    if (name) {
      const existGroup = await tx.anchorFollowGroup.findFirst({
        where: { name, id: { not: BigInt(id) }, org_id: BigInt(org_id) },
        select: { id: true },
      });
      assert(!existGroup, '分组名称已存在');
      // 更新分组信息
      await tx.anchorFollowGroup.update({
        where: { id: BigInt(id), org_id: BigInt(org_id) },
        data: {
          name: xss(name),
        },
      });
    }

    if (removed_anchor_table_ids?.length) {
      await tx.anchorFollowGroupRelation.deleteMany({
        where: {
          group_id: BigInt(id),
          anchor_table_id: {
            in: removed_anchor_table_ids.map(BigInt),
          },
        },
      });
    }

    if (added_anchor_table_ids?.length) {
      // 创建新关联
      await tx.anchorFollowGroupRelation.createMany({
        data: added_anchor_table_ids.map(anchor_table_id => ({
          group_id: BigInt(id),
          anchor_table_id: BigInt(anchor_table_id),
        })),
        skipDuplicates: true,
      });
    }
  });
}

async function deleteAnchorFromGroups(
  tx: PrismaClientTransactionContext | PrismaClient,
  groupIds: bigint[],
) {
  // 1. 找出属于指定分组的主播
  const anchorsInGroups = await tx.anchorFrom87.findMany({
    where: {
      AnchorFollowGroupRelation: {
        some: {
          group_id: {
            in: groupIds,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  // 2. 从指定分组中移除这些主播
  await tx.anchorFollowGroupRelation.deleteMany({
    where: {
      group_id: {
        in: groupIds,
      },
    },
  });

  // 3. 删除不再属于任何分组的主播
  const deletedAnchors = await tx.anchorFrom87.deleteMany({
    where: {
      id: {
        in: anchorsInGroups.map(anchor => anchor.id),
      },
      AnchorFollowGroupRelation: {
        none: {}, // 没有任何关联记录
      },
    },
  });
  return {
    deleted_anchors_count: deletedAnchors.count,
  };
}

// 删除分组
export async function deleteAnchorFollowGroup(
  data: DeleteAnchorFollowGroupRequest,
): Promise<DeleteAnchorFollowGroupResponse['data']> {
  logger.info('[Delete Anchor Follow Group]', { data });
  assert(data.org_id, '机构ID不能为空');
  const where = {
    id: {
      in: data.id.map(BigInt),
    },
    org_id: BigInt(data.org_id),
  };

  const res = await mysqlClient.prismaClient.$transaction(async tx => {
    const groups = await tx.anchorFollowGroup.findMany({
      where,
      select: {
        id: true,
      },
    });
    const { deleted_anchors_count } = await deleteAnchorFromGroups(
      tx,
      groups.map(group => group.id),
    );
    if (!data.only_anchor) {
      // 使用 Prisma deleteMany
      const result = await tx.anchorFollowGroup.deleteMany({
        where,
      });

      const deletedCount = result.count;

      return {
        groups_count: deletedCount,
        deleted_anchor_count: deleted_anchors_count,
      };
    } else {
      return {
        groups_count: groups.length,
        deleted_anchor_count: deleted_anchors_count,
      };
    }
  });
  logger.info('[Delete Anchor Follow Group Result]', { res });
  return res;
}

// 清空分组
export async function clearAnchorFollowGroup(
  data: ClearAnchorFollowGroupRequest,
): Promise<ClearAnchorFollowGroupResponse['data']> {
  logger.info('[Clear Anchor Follow Group]', { data });
  assert(data.org_id, '机构ID不能为空');
  const where = transformGroupFilterValuesToFilterValues(
    data.filter,
    data.org_id,
  );

  const res = await mysqlClient.prismaClient.$transaction(async tx => {
    const groups = await tx.anchorFollowGroup.findMany({
      where,
      select: {
        id: true,
      },
    });
    const { deleted_anchors_count } = await deleteAnchorFromGroups(
      tx,
      groups.map(group => group.id),
    );
    if (!data.only_anchor) {
      // 使用 Prisma deleteMany
      const result = await tx.anchorFollowGroup.deleteMany({
        where,
      });

      const deletedCount = result.count;

      return {
        groups_count: deletedCount,
        deleted_anchor_count: deleted_anchors_count,
      };
    } else {
      return {
        groups_count: groups.length,
        deleted_anchor_count: deleted_anchors_count,
      };
    }
  });
  logger.info('[Clear Anchor Follow Group Result]', { res });
  return res;
}
