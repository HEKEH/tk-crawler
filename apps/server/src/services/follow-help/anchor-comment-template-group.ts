import type {
  ClearAnchorCommentTemplateGroupRequest,
  ClearAnchorCommentTemplateGroupResponse,
  CreateAnchorCommentTemplateGroupRequest,
  CreateAnchorCommentTemplateGroupResponse,
  DeleteAnchorCommentTemplateGroupRequest,
  DeleteAnchorCommentTemplateGroupResponse,
  GetAnchorCommentTemplateGroupByIdRequest,
  GetAnchorCommentTemplateGroupByIdResponseData,
  GetAnchorCommentTemplateGroupListRequest,
  GetAnchorCommentTemplateGroupListResponseData,
  UpdateAnchorCommentTemplateGroupRequest,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty, transObjectValuesToString, xss } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import { transformTemplateGroupFilterValues } from './filter';

// 获取评论模板分组列表
export async function getAnchorCommentTemplateGroupList(
  data: GetAnchorCommentTemplateGroupListRequest,
): Promise<GetAnchorCommentTemplateGroupListResponseData> {
  logger.info('[Get Anchor Comment Template Group List]', { data });
  assert(data.org_id, '机构ID不能为空');

  const _orderBy = isEmpty(data.order_by)
    ? {
        updated_at: 'desc' as const, // 默认按更新时间倒序排序
      }
    : data.order_by!;

  const { templates_count, ...orderBy } = _orderBy;
  if (templates_count) {
    orderBy.AnchorCommentTemplate = {
      _count: templates_count,
    };
  }

  const filter = transformTemplateGroupFilterValues(data.filter, data.org_id);

  const [groups, total] = await Promise.all([
    mysqlClient.prismaClient.anchorCommentTemplateGroup.findMany({
      where: filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
      include: {
        _count: {
          select: {
            AnchorCommentTemplate: true,
          },
        },
      },
    }),
    mysqlClient.prismaClient.anchorCommentTemplateGroup.count({
      where: filter,
    }),
  ]);

  return {
    list: groups.map(({ _count, ...group }) => ({
      ...transObjectValuesToString(group, ['id', 'org_id']),
      templates_count: _count.AnchorCommentTemplate,
    })),
    total,
  };
}

// 获取单个评论模板分组
export async function getAnchorCommentTemplateGroupById(
  data: GetAnchorCommentTemplateGroupByIdRequest,
): Promise<GetAnchorCommentTemplateGroupByIdResponseData> {
  logger.info('[Get Anchor Comment Template Group By Id]', { data });
  assert(data.org_id, '机构ID不能为空');
  assert(data.id, '分组ID不能为空');

  const group =
    await mysqlClient.prismaClient.anchorCommentTemplateGroup.findUnique({
      where: {
        id: BigInt(data.id),
        org_id: BigInt(data.org_id),
      },
      include: {
        AnchorCommentTemplate: true,
      },
    });

  assert(group, '未找到评论模板分组');

  const { AnchorCommentTemplate, ...rest } = group;

  return {
    ...transObjectValuesToString(rest, ['id', 'org_id']),
    templates: AnchorCommentTemplate.map(template =>
      transObjectValuesToString(template, ['id', 'group_id', 'org_id']),
    ),
  };
}

// 创建评论模板分组
export async function createAnchorCommentTemplateGroup(
  data: CreateAnchorCommentTemplateGroupRequest,
): Promise<CreateAnchorCommentTemplateGroupResponse['data']> {
  logger.info('[Create Anchor Comment Template Group]', { data });

  const { org_id, name } = data;
  assert(org_id, '机构ID不能为空');
  assert(name, '分组名称不能为空');

  return await mysqlClient.prismaClient.$transaction(async tx => {
    // 检查分组名称是否已存在
    const existGroup = await tx.anchorCommentTemplateGroup.findFirst({
      where: {
        name,
        org_id: BigInt(org_id),
      },
      select: { id: true },
    });

    assert(!existGroup, '分组名称已存在');

    // 创建分组
    const group = await tx.anchorCommentTemplateGroup.create({
      data: {
        name: xss(name),
        org_id: BigInt(org_id),
      },
    });

    return { id: group.id.toString() };
  });
}

// 更新评论模板分组
export async function updateAnchorCommentTemplateGroup(
  data: UpdateAnchorCommentTemplateGroupRequest,
): Promise<void> {
  logger.info('[Update Anchor Comment Template Group]', { data });

  const { id, org_id, name } = data;
  assert(id, '分组ID不能为空');
  assert(org_id, '机构ID不能为空');
  assert(name, '分组名称不能为空');

  await mysqlClient.prismaClient.$transaction(async tx => {
    // 检查分组名称是否已存在（排除当前分组）
    const existGroup = await tx.anchorCommentTemplateGroup.findFirst({
      where: {
        name,
        id: { not: BigInt(id) },
        org_id: BigInt(org_id),
      },
      select: { id: true },
    });

    assert(!existGroup, '分组名称已存在');

    // 更新分组信息
    await tx.anchorCommentTemplateGroup.update({
      where: {
        id: BigInt(id),
        org_id: BigInt(org_id),
      },
      data: {
        name: xss(name),
      },
    });
  });
}

// 删除评论模板分组
export async function deleteAnchorCommentTemplateGroup(
  data: DeleteAnchorCommentTemplateGroupRequest,
): Promise<DeleteAnchorCommentTemplateGroupResponse['data']> {
  logger.info('[Delete Anchor Comment Template Group]', { data });
  assert(data.org_id, '机构ID不能为空');
  assert(data.ids && data.ids.length > 0, '分组ID不能为空');

  const res =
    await mysqlClient.prismaClient.anchorCommentTemplateGroup.deleteMany({
      where: {
        id: {
          in: data.ids.map(BigInt),
        },
        org_id: BigInt(data.org_id),
      },
    });

  return { deleted_count: res.count };
}

// 清空评论模板分组
export async function clearAnchorCommentTemplateGroup(
  data: ClearAnchorCommentTemplateGroupRequest,
): Promise<ClearAnchorCommentTemplateGroupResponse['data']> {
  logger.info('[Clear Anchor Comment Template Group]', { data });
  assert(data.org_id, '机构ID不能为空');

  // 使用 Prisma deleteMany
  const result =
    await mysqlClient.prismaClient.anchorCommentTemplateGroup.deleteMany({
      where: transformTemplateGroupFilterValues(data.filter, data.org_id),
    });

  const deletedCount = result.count;

  logger.info('[Clear Anchor Comment Template Group Result]', { deletedCount });

  return {
    deleted_count: deletedCount,
  };
}
