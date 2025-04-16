import type {
  GetAnchorFollowGroupListRequest,
  GetAnchorFollowGroupListResponseData,
} from '@tk-crawler/biz-shared';
import type { UseQueryParams } from '@tk-crawler/view-shared';
import { useQuery } from '@tanstack/vue-query';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { toValue } from 'vue';
import { getAnchorFollowGroupList } from '../../requests';

export function useGetFollowGroupList({
  orgId,
  pageNum,
  pageSize,
  filter,
  orderBy,
}: UseQueryParams<{
  orgId: string;
  pageNum: number;
  pageSize: number;
  filter?: GetAnchorFollowGroupListRequest['filter'];
  orderBy?: GetAnchorFollowGroupListRequest['order_by'];
}>) {
  const queryKey = [
    'anchor-follow-groups',
    orgId,
    pageNum,
    pageSize,
    filter,
    orderBy,
  ] as const;
  return useQuery<GetAnchorFollowGroupListResponseData | undefined>({
    queryKey,
    retry: false,
    queryFn: async () => {
      const response = await getAnchorFollowGroupList({
        org_id: toValue(orgId),
        page_num: toValue(pageNum),
        page_size: toValue(pageSize),
        order_by: toValue(orderBy),
        filter: toValue(filter),
      });
      if (response.status_code !== RESPONSE_CODE.SUCCESS) {
        throw new Error(response.message);
      }
      return response.data;
    },
    placeholderData: previousData => previousData,
  });
}
