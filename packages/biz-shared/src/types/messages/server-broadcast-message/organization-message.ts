import type { OrganizationItem } from '../../org-and-user';

export type BroadcastOrganizationMessageData = Pick<
  OrganizationItem,
  | 'id'
  | 'name'
  | 'membership_start_at'
  | 'membership_expire_at'
  | 'areas'
  | 'status'
  | 'ignore_commerce_anchor'
  | 'highest_diamonds_limit'
  | 'rank_league_limit'
>;

export interface BroadcastOrganizationUpdateMessage {
  type: 'update';
  data: Partial<Omit<BroadcastOrganizationMessageData, 'id'>> & {
    id: string;
  };
}

export interface BroadcastOrganizationCreateMessage {
  type: 'create';
  data: BroadcastOrganizationMessageData;
}

export interface BroadcastOrganizationDeleteMessage {
  type: 'delete';
  data: {
    id: string;
  };
}

export type BroadcastOrganizationMessage =
  | BroadcastOrganizationUpdateMessage
  | BroadcastOrganizationDeleteMessage
  | BroadcastOrganizationCreateMessage;
