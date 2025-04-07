export interface StartupResponse {
  BaseResp: {
    StatusCode: number;
    StatusMessage: string;
    Prompts: string;
  };
  IsAnonymousVpn: boolean;
  TTBARegionType: number;
  VisitorRegion: string;
  apiResource: {
    allowList: null;
    apis: null;
    userPermission: null;
  };
  appId: number;
  benefitConfig: {
    canInvite: number;
  };
  businessConfig?: {
    FeatureSwitch: {
      AgentWorkbenchV2Switch: boolean;
      CanUseCspFaq: boolean;
      CanUseFlareCardV1: boolean;
      CanUseFlareCardV2: boolean;
      CanUsePolicy2025: boolean;
      CanUsePolicy2025_HideBaseline: boolean;
      GuestShareRevenue: boolean;
      IsNewWorkbench: boolean;
      RestrictAnonymousVpn: boolean;
      RestrictAnonymousVpnWhiteList: boolean;
      TargetEditSwitch: boolean;
      UseAgentWorkbench: boolean;
      agency_activity_reverse: boolean;
      agency_mbc: boolean;
      agency_ranklist_degradation_version: boolean;
      agency_ranklist_degradation_version_v2: boolean;
      agency_ranklist_multi_stage: boolean;
      anchor_live_agency_replay_access: boolean;
      bc_account: boolean;
      enable_bootcamp_v2: boolean;
      flareCard: boolean;
      forOnlineTest: boolean;
      group_live: boolean;
      group_live_number: boolean;
      health_score: boolean;
      hide_csp_offline_ticket: boolean;
      hide_csp_offline_ticket_v2: boolean;
      high_severity: boolean;
      hostInviteCanUseTrialLive: boolean;
      hostInviteCancelMultiAccountRiskToast: boolean;
      hostInviteManageControl: boolean;
      host_calendar_schedule: boolean;
      host_lead_management: boolean;
      host_rank_export_hidden: boolean;
      host_referral: boolean;
      live_now_promote_open: boolean;
      live_now_v2_open_config: boolean;
      pk_animation_config: boolean;
      pk_detail_export: boolean;
      pk_replay_animation_config: boolean;
      platform_host_activity_config: boolean;
      policy_forecast_bonus: boolean;
      quota_account_switch: boolean;
      report_backstage: boolean;
      service_fee_decoupling: boolean;
      showPermissionManagement: boolean;
      time_display_optimization: boolean;
      [key: string]: boolean;
    };
    academyLimitTime: number;
    academyTopNoticeVersion: number;
    control: {
      AdvancedPermission: boolean;
      CanDisplayPillarBaselineInfo: boolean;
      CanExportHostList: boolean;
      CanUseAgencyPK: boolean;
      CanUseCspOfflineTicket: boolean;
      CanUseHealthScore: boolean;
      CanUseHostActivity: boolean;
      CanUseLivePK: boolean;
      CanUsePillar: boolean;
      CanUsePromote: boolean;
      CanUseRanklist: boolean;
      CanUseSelfBuiltActivity: boolean;
      EnableBootcamp: boolean;
      EnableBootcampV2: boolean;
      EnableIntelligentCustomerService: boolean;
      FactionCustomerService: boolean;
      GuestShareRevenue: boolean;
      HighSeverity: boolean;
      IMRecruitmentPermission: boolean;
      IsBootcampV1Agency: boolean;
      RecruitmentPermission: boolean;
      ShowAcademyKeystone: boolean;
      ShowCspOfflineTicketButton: boolean;
      ShowStaffPermissionManagerment: boolean;
      TTBARoomRecruitmentPermission: boolean;
      flareCard: boolean;
      managementFee: boolean;
      playback: boolean;
      serviceFee: boolean;
      sumaTipOff: boolean;
      [key: string]: boolean;
    };
    protocolMap: {
      [region: string]: Array<{
        draftID: string;
        name: string;
        starlingKey: string;
      }>;
    };
  };
  canInviteAnchor: number;
  config: {
    appId: {
      [key: string]: {
        detail: string;
        short: string;
      };
    };
    hidden_auth_api: Record<string, unknown>;
    hidden_page_config: Record<string, unknown>;
  };
  factionOnboarding: {
    regions: any[];
    relations: any[];
  };
  in_emergency: boolean;
  isSelfOrganization: number;
  list: any[];
  percent: any[];
  permissions: Array<{
    id: string;
    method: string;
    parentID: string;
    permKey: string;
    permPath: string;
  }>;
  roles: Array<{
    id: string;
    name: string;
    orgID: string;
    roleLevel: number;
    roleStatus: number;
    roleType: number;
    roleTypeName: string;
    unionID: string;
  }>;
  signStatus: number;
  testList: Record<string, unknown>;
  union: {
    country: string;
    id: string;
    in_emergency: boolean;
    name: string;
    region: string;
  };
  user: {
    avatar: string;
    bindEmail: boolean;
    bindMobile: boolean;
    email: string;
    isOrgLeader: boolean;
    name: string;
    organizationName: string;
    organizationUserID: string;
    phone: string;
    roleType: number;
    unionID: string;
    unionName: string;
    updateTime: string;
    userID: string;
    websiteID: number;
  };
}
