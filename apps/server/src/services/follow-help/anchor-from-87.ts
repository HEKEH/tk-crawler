import type {
  ClearAnchorFrom87Request,
  ClearAnchorFrom87Response,
  CreateOrUpdateAnchorFrom87Request,
  DeleteAnchorFrom87Request,
  DeleteAnchorFrom87Response,
  GetAnchorFrom87ListRequest,
  GetAnchorFrom87ListResponseData,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty, transObjectValuesToString, xss } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import { transformAnchorFilterValuesToFilterValues } from './filter';
// 获取列表
export async function getAnchorFrom87List(
  data: GetAnchorFrom87ListRequest,
): Promise<GetAnchorFrom87ListResponseData> {
  logger.info('[Get Anchor From 87 List]', { data });
  assert(data.org_id, '机构id不能为空');
  const orderBy = isEmpty(data.order_by)
    ? {
        updated_at: 'desc' as const, // 默认按更新时间倒序排序
      }
    : data.order_by!;

  const filter = transformAnchorFilterValuesToFilterValues(
    data.filter,
    data.org_id,
  );
  const [anchors, total] = await Promise.all([
    mysqlClient.prismaClient.anchorFrom87.findMany({
      where: filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    mysqlClient.prismaClient.anchorFrom87.count({
      where: filter,
    }),
  ]);

  return {
    list: anchors.map(({ group, ...anchor }) => {
      const res = transObjectValuesToString(anchor, [
        'account_id',
        'id',
        'org_id',
      ]);
      return Object.assign(res, {
        has_grouped: group !== null,
        group: group
          ? {
              id: group.id.toString(),
              name: group.name,
            }
          : undefined,
      });
    }),
    total,
  };
}

// 创建或更新
export async function createOrUpdateAnchorFrom87(
  request: CreateOrUpdateAnchorFrom87Request,
): Promise<{ created_count: number; updated_count: number }> {
  const _data = request.list;
  logger.info('[Create Or Update Anchor From 87]', {
    dataLength: _data.length,
    orgId: request.org_id,
    addNewAnchorsToGroup: request.add_new_anchors_to_group,
  });

  assert(request.org_id, '机构id不能为空');
  const orgId = BigInt(request.org_id);

  const res = await mysqlClient.prismaClient.$transaction(async tx => {
    const data = _data.map(anchor => ({
      account_id: BigInt(anchor.account_id),
      org_id: orgId,
      account: xss(anchor.account),

      // 钻石相关
      day_diamond_val: anchor.day_diamond_val,
      last_day_diamond_val: anchor.last_day_diamond_val,
      his_max_diamond_val: anchor.his_max_diamond_val,

      // 状态相关
      available: Number.isNaN(Number(anchor.available))
        ? null // 默认可用
        : Number(anchor.available),
      available_reason: anchor.available_reason,
      status: Number.isNaN(Number(anchor.status))
        ? null
        : Number(anchor.status),

      // 地区相关
      country: anchor.country,
      country_code: anchor.country_code,

      // 其他信息
      follower_count: anchor.follower_count,
      tag_title: anchor.tag_title,
      canuse_invitation_type: Number.isNaN(
        Number(anchor.canuse_invitation_type),
      )
        ? null
        : Number(anchor.canuse_invitation_type),
      pieces: anchor.pieces,
    }));
    // 批量查询现有记录
    const account_ids = data.map(anchor => anchor.account_id);
    const existingAnchors = await tx.anchorFrom87.findMany({
      where: {
        account_id: {
          in: account_ids,
        },
        org_id: orgId,
      },
      select: {
        account_id: true,
      },
    });

    const existingAccountIds = new Set(existingAnchors.map(a => a.account_id));

    // 分离新增和更新数据
    const toCreate = data.filter(
      anchor => !existingAccountIds.has(anchor.account_id),
    );
    const toUpdate = data.filter(anchor =>
      existingAccountIds.has(anchor.account_id),
    );

    const batchCreate = async () => {
      if (toCreate.length > 0) {
        const groupId = request.add_new_anchors_to_group?.group_id
          ? BigInt(request.add_new_anchors_to_group.group_id)
          : undefined;
        const result = await tx.anchorFrom87.createMany({
          data: toCreate.map(anchor =>
            groupId
              ? {
                  ...anchor,
                  group_id: groupId,
                }
              : anchor,
          ),
          skipDuplicates: true,
        });
        return result;
      }
    };

    const batchUpdate = async () => {
      // 批量更新
      if (toUpdate.length > 0) {
        await Promise.all(
          toUpdate.map(anchor =>
            tx.anchorFrom87.update({
              where: {
                org_id_account_id: {
                  org_id: BigInt(orgId),
                  account_id: anchor.account_id,
                },
              },
              data: anchor,
            }),
          ),
        );
      }
    };

    const [createResult] = await Promise.all([batchCreate(), batchUpdate()]);

    return {
      created_count: createResult?.count || 0,
      updated_count: toUpdate.length,
    };
  });
  return res;
}

// 删除指定记录
export async function deleteAnchorFrom87(
  data: DeleteAnchorFrom87Request,
): Promise<DeleteAnchorFrom87Response['data']> {
  logger.info('[Delete Anchor From 87]', { idCount: data.id.length });

  const result = await mysqlClient.prismaClient.anchorFrom87.deleteMany({
    where: {
      id: {
        in: data.id.map(BigInt),
      },
      org_id: BigInt(data.org_id),
    },
  });

  logger.info('[Delete Anchor From 87 Result]', { deletedCount: result.count });

  return {
    deleted_count: result.count,
  };
}

// 清空记录
export async function clearAnchorFrom87(
  data: ClearAnchorFrom87Request,
): Promise<ClearAnchorFrom87Response['data']> {
  logger.info('[Clear Anchor From 87]', data);

  // 使用 Prisma deleteMany
  const result = await mysqlClient.prismaClient.anchorFrom87.deleteMany({
    where: transformAnchorFilterValuesToFilterValues(data.filter, data.org_id),
  });

  const deletedCount = result.count;

  logger.info('[Clear Anchor From 87 Result]', { deletedCount });

  return {
    deleted_count: deletedCount,
  };
}
