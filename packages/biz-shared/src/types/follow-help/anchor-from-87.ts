export interface AnchorFrom87 {
  id: string;
  org_id: string;
  account_id: string;
  account: string;

  // 钻石相关
  day_diamond_val: number;
  last_day_diamond_val: number;
  his_max_diamond_val: number;

  // 状态相关
  available: number | null;
  available_reason: string | null;
  status: number | null;

  // 地区相关
  country: string | null;
  country_code: string | null;

  // 其他信息
  follower_count: number;
  tag_title: string | null;
  canuse_invitation_type: number | null; // 3普通邀约，4金票邀约
  pieces: string | null;

  // 时间戳
  created_at: Date;
  updated_at: Date;

  // 是否已分组
  has_grouped: boolean;
}

export type AnchorFrom87RawData = Omit<
  AnchorFrom87,
  'created_at' | 'updated_at' | 'has_grouped' | 'id' | 'org_id'
>;
