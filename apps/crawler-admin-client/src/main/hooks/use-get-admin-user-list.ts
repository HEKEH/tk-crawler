import type {
  GetSystemAdminUserListRequest,
  GetSystemAdminUserListResponseData,
} from '@tk-crawler/biz-shared';
import type { UseQueryParams } from '@tk-crawler/view-shared';
import type { ComputedRef } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { toValue } from 'vue';
import { getSystemAdminUserList } from '../requests';

export function useGetAdminUserList(
  {
    pageNum,
    pageSize,
    filter,
    orderBy,
  }: UseQueryParams<{
    pageNum: number;
    pageSize: number;
    filter?: GetSystemAdminUserListRequest['filter'];
    orderBy?: GetSystemAdminUserListRequest['order_by'];
  }>,
  token: ComputedRef<string>,
) {
  const queryKey = [
    'use-get-admin-user-list',
    token,
    pageNum,
    pageSize,
    filter,
    orderBy,
  ] as const;
  return useQuery<GetSystemAdminUserListResponseData | undefined>({
    queryKey,
    retry: false,
    // refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await getSystemAdminUserList(
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
