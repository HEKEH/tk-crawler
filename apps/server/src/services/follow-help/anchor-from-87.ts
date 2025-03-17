import type {
  ClearAnchorFrom87Request,
  ClearAnchorFrom87Response,
  CreateOrUpdateAnchorFrom87Request,
  DeleteAnchorFrom87Request,
  DeleteAnchorFrom87Response,
  GetAnchorFrom87ListRequest,
  GetAnchorFrom87ListResponseData,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database/mysql';
import { isEmpty, transObjectValuesToString, xss } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import { transformAnchorFilterValuesToFilterValues } from './filter';
// 获取列表
export async function getAnchorFrom87List(
  data: GetAnchorFrom87ListRequest,
): Promise<GetAnchorFrom87ListResponseData> {
  logger.info('[Get Anchor From 87 List]', { data });
  const orderBy = isEmpty(data.order_by)
    ? {
        updated_at: 'desc' as const, // 默认按更新时间倒序排序
      }
    : data.order_by!;

  const filter = transformAnchorFilterValuesToFilterValues(data.filter);
  const [anchors, total] = await Promise.all([
    mysqlClient.prismaClient.anchorFrom87.findMany({
      where: filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
      include: {
        AnchorFollowGroupRelation: {
          select: {
            id: true,
          },
          take: 1, // 只需要查询一条记录
        },
      },
    }),
    mysqlClient.prismaClient.anchorFrom87.count({
      where: filter,
    }),
  ]);

  return {
    list: anchors.map(({ AnchorFollowGroupRelation, ...anchor }) => {
      const res = transObjectValuesToString(anchor, ['account_id', 'id']);
      return Object.assign(res, {
        has_grouped: AnchorFollowGroupRelation.length > 0,
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
  });

  const res = await mysqlClient.prismaClient.$transaction(async tx => {
    const data = _data.map(anchor => ({
      account_id: BigInt(anchor.account_id),
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

    // 批量创建
    const created_count =
      toCreate.length > 0
        ? (
            await tx.anchorFrom87.createMany({
              data: toCreate,
              skipDuplicates: true,
            })
          ).count
        : 0;

    // 批量更新
    if (toUpdate.length > 0) {
      await Promise.all(
        toUpdate.map(anchor =>
          tx.anchorFrom87.update({
            where: { account_id: anchor.account_id },
            data: anchor,
          }),
        ),
      );
    }

    return {
      created_count,
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

  let deletedCount = 0;

  if (isEmpty(data.filter)) {
    deletedCount = await mysqlClient.prismaClient.anchorFrom87.count();

    // 执行删除
    await mysqlClient.prismaClient.$executeRaw`DELETE FROM AnchorFrom87`;
  } else {
    // 使用 Prisma deleteMany
    const result = await mysqlClient.prismaClient.anchorFrom87.deleteMany({
      where: transformAnchorFilterValuesToFilterValues(data.filter),
    });

    deletedCount = result.count;
  }

  logger.info('[Clear Anchor From 87 Result]', { deletedCount });

  return {
    deleted_count: deletedCount,
  };
}
