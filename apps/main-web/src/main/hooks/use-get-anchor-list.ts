import type {
  GetAnchorListRequest,
  GetAnchorListResponseData,
} from '@tk-crawler/biz-shared';
import type { UseQueryParams } from '@tk-crawler/view-shared';
import { useQuery } from '@tanstack/vue-query';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { toValue } from 'vue';
import { getAnchorList } from '../requests';

export function useGetAnchorList(
  {
    pageNum,
    pageSize,
    filter,
    orderBy,
  }: UseQueryParams<{
    pageNum: number;
    pageSize: number;
    filter?: GetAnchorListRequest['filter'];
    orderBy?: GetAnchorListRequest['order_by'];
  }>,
  token: string,
) {
  const queryKey = [
    'use-tk-anchor-list',
    token,
    pageNum,
    pageSize,
    filter,
    orderBy,
  ] as const;
  return useQuery<GetAnchorListResponseData | undefined>({
    queryKey,
    retry: false,
    queryFn: async () => {
      const response = await getAnchorList(
        {
          page_num: toValue(pageNum),
          page_size: toValue(pageSize),
          order_by: toValue(orderBy),
          filter: toValue(filter),
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
