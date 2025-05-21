import type {
  ClearAnchorCommentTemplateRequest,
  ClearAnchorCommentTemplateResponse,
  CreateAnchorCommentTemplateRequest,
  CreateAnchorCommentTemplateResponse,
  DeleteAnchorCommentTemplateRequest,
  DeleteAnchorCommentTemplateResponse,
  GetAnchorCommentTemplateListRequest,
  GetAnchorCommentTemplateListResponseData,
  UpdateAnchorCommentTemplateRequest,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty, transObjectValuesToString, xss } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import { BusinessError } from '../../utils';
import { transformTemplateFilterValues } from './filter';

// 获取评论模板列表
export async function getAnchorCommentTemplateList(
  data: GetAnchorCommentTemplateListRequest & {
    org_id: string;
  },
): Promise<GetAnchorCommentTemplateListResponseData> {
  logger.info('[Get Anchor Comment Template List]', { data });
  assert(data.org_id, '机构ID不能为空');

  const orderBy = isEmpty(data.order_by)
    ? {
        updated_at: 'desc' as const, // 默认按更新时间倒序排序
      }
    : data.order_by!;

  const filter = transformTemplateFilterValues(data.filter, data.org_id);

  const [templates, total] = await Promise.all([
    mysqlClient.prismaClient.anchorCommentTemplate.findMany({
      where: filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
      include: {
        group: true,
      },
    }),
    mysqlClient.prismaClient.anchorCommentTemplate.count({
      where: filter,
    }),
  ]);

  return {
    list: templates.map(({ group, ...template }) => ({
      ...transObjectValuesToString(template, ['id', 'group_id', 'org_id']),
      group_name: group.name,
    })),
    total,
  };
}

// 创建评论模板
export async function createAnchorCommentTemplate(
  data: CreateAnchorCommentTemplateRequest & {
    org_id: string;
  },
): Promise<CreateAnchorCommentTemplateResponse['data']> {
  logger.info('[Create Anchor Comment Template]', { data });

  const { org_id, group_id, templates } = data;
  assert(org_id, '机构ID不能为空');
  assert(group_id, '分组ID不能为空');
  assert(templates && templates.length > 0, '模板内容不能为空');

  return await mysqlClient.prismaClient.$transaction(async tx => {
    // 检查分组是否存在且属于该机构
    const group = await tx.anchorCommentTemplateGroup.findUnique({
      where: {
        id: BigInt(group_id),
        org_id: BigInt(org_id),
      },
    });

    assert(group, '分组不存在或无权访问');

    // 创建模板
    const createdTemplates = await Promise.all(
      templates.map(template =>
        tx.anchorCommentTemplate.create({
          data: {
            org_id: BigInt(org_id),
            group_id: BigInt(group_id),
            content: xss(template.content),
            label: template.label ? xss(template.label) : null,
          },
        }),
      ),
    );

    return {
      ids: createdTemplates.map(template => template.id.toString()),
    };
  });
}

// 更新评论模板
export async function updateAnchorCommentTemplate(
  data: UpdateAnchorCommentTemplateRequest & {
    org_id: string;
  },
): Promise<void> {
  logger.info('[Update Anchor Comment Template]', { data });

  const { org_id, template } = data;
  assert(org_id, '机构ID不能为空');
  assert(template.id, '模板ID不能为空');

  await mysqlClient.prismaClient.$transaction(async tx => {
    // 检查模板是否存在且属于该机构
    const existingTemplate = await tx.anchorCommentTemplate.findUnique({
      where: {
        id: BigInt(template.id),
        org_id: BigInt(org_id),
      },
    });

    assert(existingTemplate, '模板不存在');

    // 更新模板信息
    const updateData: Omit<
      UpdateAnchorCommentTemplateRequest['template'],
      'id'
    > = {};

    if (template.content !== undefined) {
      updateData.content = xss(template.content);
    }

    if (template.label !== undefined) {
      updateData.label = template.label ? xss(template.label) : null;
    }

    await tx.anchorCommentTemplate.update({
      where: {
        id: BigInt(template.id),
      },
      data: updateData,
    });
  });
}

// 删除评论模板
export async function deleteAnchorCommentTemplate(
  data: DeleteAnchorCommentTemplateRequest & {
    org_id: string;
  },
): Promise<DeleteAnchorCommentTemplateResponse['data']> {
  logger.info('[Delete Anchor Comment Template]', { data });
  assert(data.org_id, '机构ID不能为空');
  const ids = [...new Set(data.ids)];
  assert(ids.length > 0, '模板ID不能为空');

  const where = {
    id: {
      in: ids.map(BigInt),
    },
  };

  // 首先验证所有模板是否属于该机构
  const templates =
    await mysqlClient.prismaClient.anchorCommentTemplate.findMany({
      where,
    });

  // 检查是否所有模板都属于该机构
  if (templates.some(template => template.org_id.toString() !== data.org_id)) {
    throw new BusinessError('存在无权删除的模板');
  }

  const res = await mysqlClient.prismaClient.anchorCommentTemplate.deleteMany({
    where,
  });

  return { deleted_count: res.count };
}

// 清空评论模板
export async function clearAnchorCommentTemplate(
  data: ClearAnchorCommentTemplateRequest & {
    org_id: string;
  },
): Promise<ClearAnchorCommentTemplateResponse['data']> {
  logger.info('[Clear Anchor Comment Template]', { data });
  assert(data.org_id, '机构ID不能为空');

  // 执行删除
  const result =
    await mysqlClient.prismaClient.anchorCommentTemplate.deleteMany({
      where: transformTemplateFilterValues(data.filter, data.org_id),
    });

  const deletedCount = result.count;

  logger.info('[Clear Anchor Comment Template Result]', { deletedCount });

  return {
    deleted_count: deletedCount,
  };
}
