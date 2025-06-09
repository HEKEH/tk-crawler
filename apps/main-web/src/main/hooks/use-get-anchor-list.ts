import type {
  GetAnchorListRequest,
  GetAnchorListResponseData,
} from '@tk-crawler/biz-shared';
import type { UseQueryParams } from '@tk-crawler/view-shared';
import type { ComputedRef } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { UseTkAnchorList } from '@tk-crawler/secure';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { ref, toValue, watch } from 'vue';
import { getAnchorList } from '../requests';

export function useGetAnchorList(
  {
    pageNum,
    pageSize,
    filter,
    orderBy,
    includeTaskAssign,
    includeAnchorContact,
  }: UseQueryParams<{
    pageNum: number;
    pageSize: number;
    filter?: GetAnchorListRequest['filter'];
    orderBy?: GetAnchorListRequest['order_by'];
    includeTaskAssign?: boolean;
    includeAnchorContact?: boolean;
  }>,
  token: ComputedRef<string>,
) {
  const queryKey = [
    UseTkAnchorList,
    token,
    pageNum,
    pageSize,
    filter,
    orderBy,
    includeTaskAssign,
    includeAnchorContact,
  ] as const;
  const { data: originalData, ...rest } = useQuery<
    GetAnchorListResponseData | undefined
  >({
    queryKey,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!token.value) {
        return {
          list: [],
          total: 0,
        };
      }
      const response = await getAnchorList(
        {
          page_num: toValue(pageNum),
          page_size: toValue(pageSize),
          order_by: toValue(orderBy),
          filter: toValue(filter),
          include_task_assign: toValue(includeTaskAssign),
          include_anchor_contact: toValue(includeAnchorContact),
        },
        token.value,
      );
      if (response.status_code !== RESPONSE_CODE.SUCCESS) {
        throw new Error(response.message);
      }
      return response.data;
    },
    placeholderData: previousData => previousData,
  });
  // 创建可编辑的本地数据
  const data = ref<GetAnchorListResponseData | undefined>();

  // 监听原始数据变化，更新可编辑数据
  watch(
    originalData,
    newData => {
      data.value = newData
        ? {
            list: newData.list.map(item => ({ ...item })),
            total: newData.total,
          }
        : undefined;
    },
    { immediate: true },
  );
  return {
    data,
    ...rest,
  };
}
