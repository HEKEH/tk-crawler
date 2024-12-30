export interface LiveRoomOwner {
  id: number;
  id_str: string;
  nickname: string;
  bio_description: string;
  avatar_thumb: {
    url_list: string[];
    uri: string;
  };
  avatar_medium: {
    url_list: string[];
    uri: string;
  };
  avatar_large: {
    url_list: string[];
    uri: string;
  };
  status: number;
  modify_time: number;
  follow_info: {
    following_count: number;
    follower_count: number;
  };
  display_id: string;
  sec_uid: string;
}

export interface FeedItem {
  type: number;
  rid: string;
  data: {
    id: number;
    id_str: string;
    status: number;
    owner_user_id: number;
    title: string;
    user_count: number;
    os_type: number;
    client_version: number;
    cover: {
      url_list: string[];
      uri: string;
    };
    stream_url: {
      rtmp_pull_url: string;
      flv_pull_url: {
        FULL_HD1: string;
        SD2: string;
        SD1: string;
        HD1: string;
      };
      flv_pull_url_params: {
        HD1: string;
        FULL_HD1: string;
        SD2: string;
        SD1: string;
      };
      stream_size_width: number;
      stream_size_height: number;
    };
    owner: LiveRoomOwner;
    has_commerce_goods: boolean;
    room_auth: {
      Chat: boolean;
      Gift: boolean;
      LuckMoney: boolean;
      Digg: boolean;
      UserCard: boolean;
      Banner: number;
      Landscape: number;
      PublicScreen: number;
      GiftAnchorMt: number;
      DonationSticker: number;
      InteractionQuestion: boolean;
      ChatL2: boolean;
      Viewers: boolean;
      Share: boolean;
      transaction_history: number;
      UserCount: number;
      Rank: number;
      BroadcastMessage: number;
    };
  };
  live_reason: string;
}

export type FeedResponse = {
  status_code: 0;
  extra: {
    log_pb: {
      impr_id: string;
    };
    has_more: boolean;
    cost: number;
    max_time: number;
    total: number;
    banner: Record<string, unknown>;
    unread_extra: string;
    now: number;
  };
  data: FeedItem[];
} | {
  status_code: number;
  message: string;
}
