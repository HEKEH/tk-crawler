import type {
  GetAnchorListRequest,
  GetAnchorListResponseData,
} from '@tk-crawler/biz-shared';
import type { UseQueryParams } from '@tk-crawler/view-shared';
import { useQuery } from '@tanstack/vue-query';
import { UseTkAnchorList } from '@tk-crawler/secure';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { toValue } from 'vue';
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
  token: string,
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
  return useQuery<GetAnchorListResponseData | undefined>({
    queryKey,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await getAnchorList(
        {
          page_num: toValue(pageNum),
          page_size: toValue(pageSize),
          order_by: toValue(orderBy),
          filter: toValue(filter),
          include_task_assign: toValue(includeTaskAssign),
          include_anchor_contact: toValue(includeAnchorContact),
        },
        token,
      );
      if (response.status_code !== RESPONSE_CODE.SUCCESS) {
        throw new Error(response.message);
      }
      return response.data;
    },
    placeholderData: previousData => previousData,
  });
}
