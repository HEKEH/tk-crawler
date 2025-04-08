import type { CollectedAnchorInfo } from '../../anchor';

export type BroadcastAnchorMessageData = Pick<
  CollectedAnchorInfo,
  'user_id' | 'display_id' | 'region' | 'has_commerce_goods'
>;

export interface BroadcastAnchorMessage {
  data: BroadcastAnchorMessageData;
}
