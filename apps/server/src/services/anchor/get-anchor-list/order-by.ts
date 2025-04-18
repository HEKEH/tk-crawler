import type {
  AnchorInviteCheckOrderByInput,
  GetAnchorListOrderBy,
} from '@tk-crawler/biz-shared';
import { BusinessError } from '../../../utils';

export function transformAnchorListOrderBy(
  orderBy: GetAnchorListOrderBy | undefined,
): AnchorInviteCheckOrderByInput {
  if (!orderBy || Object.keys(orderBy).length === 0) {
    // 默认时间倒序
    return {
      checked_at: 'desc',
    };
  }
  const result: AnchorInviteCheckOrderByInput = {};
  if ('checked_at' in orderBy && orderBy.checked_at) {
    result.checked_at = orderBy.checked_at;
  } else if ('checked_result' in orderBy && orderBy.checked_result) {
    result.checked_result = orderBy.checked_result;
  } else if ('invite_type' in orderBy && orderBy.invite_type) {
    result.invite_type = orderBy.invite_type;
  } else if ('area' in orderBy && orderBy.area) {
    result.area = orderBy.area;
  } else if ('display_id' in orderBy && orderBy.display_id) {
    result.anchor = { display_id: orderBy.display_id };
  } else if ('user_id' in orderBy && orderBy.user_id) {
    result.anchor = { user_id: orderBy.user_id };
  } else if ('follower_count' in orderBy && orderBy.follower_count) {
    result.anchor = { follower_count: orderBy.follower_count };
  } else if ('audience_count' in orderBy && orderBy.audience_count) {
    result.anchor = { audience_count: orderBy.audience_count };
  } else if ('current_diamonds' in orderBy && orderBy.current_diamonds) {
    result.anchor = { current_diamonds: orderBy.current_diamonds };
  } else if ('last_diamonds' in orderBy && orderBy.last_diamonds) {
    result.anchor = { last_diamonds: orderBy.last_diamonds };
  } else if ('highest_diamonds' in orderBy && orderBy.highest_diamonds) {
    result.anchor = { highest_diamonds: orderBy.highest_diamonds };
  } else if ('rank_league' in orderBy && orderBy.rank_league) {
    result.anchor = { rank_league: orderBy.rank_league };
  } else if ('region' in orderBy && orderBy.region) {
    result.anchor = { region: orderBy.region };
  } else if ('has_commerce_goods' in orderBy && orderBy.has_commerce_goods) {
    result.anchor = { has_commerce_goods: orderBy.has_commerce_goods };
  } else if ('tag' in orderBy && orderBy.tag) {
    result.anchor = { tag: orderBy.tag };
  } else if ('room_id' in orderBy && orderBy.room_id) {
    result.anchor = { room_id: orderBy.room_id };
  } else if ('assign_to' in orderBy && orderBy.assign_to) {
    result.assign_to = orderBy.assign_to;
  } else {
    throw new BusinessError(`Invalid orderBy: ${JSON.stringify(orderBy)}`);
  }

  return result;
}
