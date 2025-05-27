import { SystemAdminUserRole } from './roles';

export enum AdminFeature {
  /** 只能查看、操作自己创建的机构 */
  ONLY_OWN_ORG = 'only_own_org',
}

const ROLE_TO_FEATURES_MAP: {
  [key in SystemAdminUserRole]?: AdminFeature[];
} = {
  [SystemAdminUserRole.DEALER]: [AdminFeature.ONLY_OWN_ORG],
};

export function getAdminFeaturesByRole(role: SystemAdminUserRole) {
  return ROLE_TO_FEATURES_MAP[role] || [];
}
