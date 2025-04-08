import type { TKGuildUser } from '../../tk-guild-user';

export type BroadcastGuildUserMessageData = Pick<
  TKGuildUser,
  | 'id'
  | 'username'
  | 'org_id'
  | 'status'
  | 'max_query_per_hour'
  | 'max_query_per_day'
  | 'cookie'
  | 'faction_id'
  | 'area'
>;

export interface BroadcastGuildUserCreateMessage {
  type: 'create';
  data: BroadcastGuildUserMessageData;
}

export interface BroadcastGuildUserUpdateMessage {
  type: 'update';
  data: Partial<Omit<BroadcastGuildUserMessageData, 'id'>> & {
    id: string;
  };
}

export interface BroadcastGuildUserDeleteMessage {
  type: 'delete';
  data: {
    ids: string[];
  };
}

export type BroadcastGuildUserMessage =
  | BroadcastGuildUserUpdateMessage
  | BroadcastGuildUserCreateMessage
  | BroadcastGuildUserDeleteMessage;
