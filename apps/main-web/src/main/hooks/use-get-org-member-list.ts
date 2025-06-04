import type {
  GetOrgMemberListRequest,
  GetOrgMemberListResponseData,
} from '@tk-crawler/biz-shared';
import type { UseQueryParams } from '@tk-crawler/view-shared';
import type { ComputedRef } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { toValue } from 'vue';
import { getOrgMemberList } from '../requests';

export function useGetOrgMemberList(
  {
    pageNum,
    pageSize,
    filter,
    orderBy,
  }: UseQueryParams<{
    pageNum: number;
    pageSize: number;
    filter?: GetOrgMemberListRequest['filter'];
    orderBy?: GetOrgMemberListRequest['order_by'];
  }>,
  token: ComputedRef<string>,
) {
  const queryKey = [
    'use-get-org-member-list',
    token,
    pageNum,
    pageSize,
    filter,
    orderBy,
  ] as const;
  return useQuery<GetOrgMemberListResponseData | undefined>({
    queryKey,
    retry: false,
    // refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!token.value) {
        return {
          list: [],
          total: 0,
        };
      }
      const response = await getOrgMemberList(
        {
          page_num: toValue(pageNum),
          page_size: toValue(pageSize),
          order_by: toValue(orderBy),
          filter: toValue(filter),
        },
        token.value,
      );
      return response.data;
    },
    placeholderData: previousData => previousData,
  });
}
