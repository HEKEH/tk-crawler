import type {
  ClearAnchorFollowGroupRequest,
  CreateAnchorFollowGroupRequest,
  DeleteAnchorFollowGroupRequest,
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
import { isEmpty, transObjectValuesToString } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';

// 获取列表
export async function getAnchorFollowGroupList(
  data: GetAnchorFollowGroupListRequest,
): Promise<GetAnchorFollowGroupListResponseData> {
  logger.info('[Get Anchor Follow Group List]', { data });
  const orderBy = isEmpty(data.order_by)
    ? {
        updated_at: 'desc' as const, // 默认按更新时间倒序排序
      }
    : data.order_by!;

  const [groups, total] = await Promise.all([
    mysqlClient.prismaClient.anchorFollowGroup.findMany({
      where: data.filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
    }),
    mysqlClient.prismaClient.anchorFollowGroup.count({
      where: data.filter,
    }),
  ]);

  return {
    list: groups.map(group => transObjectValuesToString(group, ['id'])),
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
    // 创建分组
    const group = await tx.anchorFollowGroup.create({
      data: groupData,
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

  const { id, added_anchor_ids, removed_anchor_ids, ...updateData } = data;

  await mysqlClient.prismaClient.$transaction(async tx => {
    // 更新分组信息
    await tx.anchorFollowGroup.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

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
): Promise<void> {
  logger.info('[Delete Anchor Follow Group]', { data });

  await mysqlClient.prismaClient.anchorFollowGroup.deleteMany({
    where: {
      id: {
        in: data.id.map(BigInt),
      },
    },
  });
}

// 清空分组
export async function clearAnchorFollowGroup(
  data: ClearAnchorFollowGroupRequest,
): Promise<void> {
  logger.info('[Clear Anchor Follow Group]', { data });

  await mysqlClient.prismaClient.anchorFollowGroup.deleteMany({
    where: data.filter,
  });
}
