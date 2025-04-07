export enum CanUseInvitationType {
  /** 普通邀约 */
  Regular = 3,
  /** 金票邀约 */
  Elite = 4,
}
export interface AnchorCheckInfo {
  /** 0代表可邀约 */
  AnchorStatus: number;
  CanUseInvitationType?: CanUseInvitationType[];
  DisplayReason: number;
  HasBricRisk: boolean;
  IsFollow: boolean;
  /** 如果是false，代表可邀约 */
  MultiAccountNotMeetBasicQualification?: boolean;
  UserBaseInfo: {
    Avatar: string;
    DisplayID: string;
    InEmergency: boolean;
    NickName: string;
    NoPermission: boolean;
    UserID: string;
  };
}
export interface BatchCheckAnchorData {
  AnchorList: AnchorCheckInfo[];
  DontHaveInviteBenefit: boolean;
  IsBanned: boolean;
  SearchID: string;
}

export interface BatchCheckAnchorResponse {
  status_code: number;
  data?: BatchCheckAnchorData;
  message?: string;
}
