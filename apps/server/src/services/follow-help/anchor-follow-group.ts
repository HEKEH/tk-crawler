import type {
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
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database/mysql';
import { isEmpty, transObjectValuesToString, xss } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import { transformGroupFilterValuesToFilterValues } from './filter';

// 获取列表
export async function getAnchorFollowGroupList(
  data: GetAnchorFollowGroupListRequest,
): Promise<GetAnchorFollowGroupListResponseData> {
  logger.info('[Get Anchor Follow Group List]', { data });
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
  const filter = transformGroupFilterValuesToFilterValues(data.filter);
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

  const group = await mysqlClient.prismaClient.anchorFollowGroup.findUnique({
    where: { id: BigInt(data.id) },
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
        transObjectValuesToString(relation.AnchorFrom87, ['account_id', 'id']),
      ),
    },
    ['id'],
  );
}

// 获取带主播IDs的分组
export async function getAnchorFollowGroupWithAnchorIds(
  data: GetAnchorFollowGroupWithAnchorIdsRequest,
): Promise<GetAnchorFollowGroupWithAnchorIdsResponse['data']> {
  logger.info('[Get Anchor Follow Group With Anchor Ids]', { data });

  const group = await mysqlClient.prismaClient.anchorFollowGroup.findUnique({
    where: { id: BigInt(data.id) },
    include: {
      AnchorFollowGroupRelation: {
        select: {
          anchor_id: true,
        },
      },
    },
  });

  assert(group, '未找到主播分组');

  const { AnchorFollowGroupRelation, ...rest } = group;

  return {
    ...transObjectValuesToString(rest, ['id']),
    anchor_ids: AnchorFollowGroupRelation.map(relation =>
      relation.anchor_id.toString(),
    ),
  };
}

// 创建分组
export async function createAnchorFollowGroup(
  data: CreateAnchorFollowGroupRequest,
): Promise<{ id: string }> {
  logger.info('[Create Anchor Follow Group]', { data });

  const { anchor_ids, ...groupData } = data;

  return await mysqlClient.prismaClient.$transaction(async tx => {
    const { name } = groupData;
    const existGroup = await tx.anchorFollowGroup.findFirst({
      where: { name },
      select: { id: true },
    });
    assert(!existGroup, '分组名称已存在');

    // 创建分组
    const group = await tx.anchorFollowGroup.create({
      data: {
        ...groupData,
        name: xss(name),
      },
    });

    // 创建关联关系
    if (anchor_ids?.length) {
      await tx.anchorFollowGroupRelation.createMany({
        data: anchor_ids.map(anchor_id => ({
          group_id: group.id,
          anchor_id: BigInt(anchor_id),
        })),
        skipDuplicates: true,
      });
    }

    return { id: group.id.toString() };
  });
}

// 更新分组
export async function updateAnchorFollowGroup(
  data: UpdateAnchorFollowGroupRequest,
): Promise<void> {
  logger.info('[Update Anchor Follow Group]', { data });

  const { id, added_anchor_ids, removed_anchor_ids, name } = data;

  await mysqlClient.prismaClient.$transaction(async tx => {
    if (name) {
      const existGroup = await tx.anchorFollowGroup.findFirst({
        where: { name, id: { not: BigInt(id) } },
        select: { id: true },
      });
      assert(!existGroup, '分组名称已存在');
      // 更新分组信息
      await tx.anchorFollowGroup.update({
        where: { id: BigInt(id) },
        data: {
          name: xss(name),
        },
      });
    }

    if (removed_anchor_ids?.length) {
      await tx.anchorFollowGroupRelation.deleteMany({
        where: {
          group_id: BigInt(id),
          anchor_id: {
            in: removed_anchor_ids.map(BigInt),
          },
        },
      });
    }

    if (added_anchor_ids?.length) {
      // 创建新关联
      await tx.anchorFollowGroupRelation.createMany({
        data: added_anchor_ids.map(anchor_id => ({
          group_id: BigInt(id),
          anchor_id: BigInt(anchor_id),
        })),
        skipDuplicates: true,
      });
    }
  });
}

// 删除分组
export async function deleteAnchorFollowGroup(
  data: DeleteAnchorFollowGroupRequest,
): Promise<DeleteAnchorFollowGroupResponse['data']> {
  logger.info('[Delete Anchor Follow Group]', { data });

  const res = await mysqlClient.prismaClient.anchorFollowGroup.deleteMany({
    where: {
      id: {
        in: data.id.map(BigInt),
      },
    },
  });

  return { deleted_count: res.count };
}

// 清空分组
export async function clearAnchorFollowGroup(
  data: ClearAnchorFollowGroupRequest,
): Promise<ClearAnchorFollowGroupResponse['data']> {
  logger.info('[Clear Anchor Follow Group]', { data });

  let deletedCount = 0;

  if (isEmpty(data.filter)) {
    deletedCount = await mysqlClient.prismaClient.anchorFollowGroup.count();

    // 执行删除
    await mysqlClient.prismaClient.$executeRaw`DELETE FROM AnchorFollowGroup`;
  } else {
    // 使用 Prisma deleteMany
    const result = await mysqlClient.prismaClient.anchorFollowGroup.deleteMany({
      where: transformGroupFilterValuesToFilterValues(data.filter),
    });

    deletedCount = result.count;
  }

  logger.info('[Clear Anchor Follow Group Result]', { deletedCount });

  return {
    deleted_count: deletedCount,
  };
}
